from playwright.sync_api import sync_playwright
import math, time
import sys
URL=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8765/'
errs=[]

def dismiss(p):
  for _ in range(16):
    if p.is_visible('#dlg'):
      p.click('#dlg'); p.wait_for_timeout(50)
    else: break

class Stick:
  def __init__(self,p):
    self.p=p; self.down=False; self.ox,self.oy=180,640
  def start(self):
    if self.down: return
    self.p.mouse.move(self.ox,self.oy); self.p.mouse.down(); self.down=True
  def steer(self,tx,ty):
    st=self.p.evaluate('G.cur.state()')
    dx,dy=tx-st['px'],ty-st['py']; n=math.hypot(dx,dy) or 1
    mag=55
    self.start()
    self.p.mouse.move(self.ox+(dx/n)*mag, self.oy+(dy/n)*mag, steps=2)
  def stop(self):
    if self.down:
      self.p.mouse.up(); self.down=False

def walk_to(p, stick, tx, ty, timeout=5.0, rad=0.075):
  t0=time.time()
  while time.time()-t0 < timeout:
    st=p.evaluate('G.cur.state()')
    if st.get('done') or p.query_selector('#cont'): return True
    if math.hypot(st['px']-tx, st['py']-ty) < rad:
      stick.stop(); return True
    stick.steer(tx,ty)
    p.wait_for_timeout(120)
  stick.stop(); return False

with sync_playwright() as pw:
  b=pw.chromium.launch()
  p=b.new_page(viewport={'width':360,'height':780},has_touch=True)
  p.on('pageerror',lambda e: errs.append(str(e)))
  p.on('console',lambda m: m.type=='error' and errs.append(m.text))
  p.goto(URL); p.evaluate('localStorage.clear()'); p.reload(); p.wait_for_timeout(600)
  dismiss(p)
  assert p.evaluate("document.querySelector('meta[name=game-version]').content")=='v2.4'
  p.click('[data-m=prep1]'); dismiss(p); p.wait_for_timeout(300)
  assert p.query_selector('#play') and p.query_selector('.objstrip')
  assert not p.query_selector('.tray') and not p.query_selector('[data-i]')

  stick=Stick(p)
  # prove drag moves character
  before=p.evaluate('G.cur.state()')
  stick.steer(0.85,0.88); p.wait_for_timeout(600); stick.stop()
  after=p.evaluate('G.cur.state()')
  moved=abs(after['px']-before['px'])+abs(after['py']-before['py'])
  print('drag moved', round(moved,3))
  assert moved>0.03

  safety=0
  while safety < 60:
    safety+=1
    st=p.evaluate('G.cur.state()')
    if st['done'] or p.query_selector('#cont'):
      break
    shelf_left=[it for it in st['shelf'] if not it['gone']]
    # fill hands first
    if len(st['carry']) < 3 and shelf_left:
      # prefer item matching a zone we'll visit; else nearest
      nxt=min(shelf_left, key=lambda it:(it['x']-st['px'])**2+(it['y']-st['py'])**2)
      walk_to(p, stick, nxt['x'], nxt['y'], timeout=4.5, rad=0.07)
      p.wait_for_timeout(150)
      continue
    if st['carry']:
      z=p.evaluate("ITEMS[G.cur.state().carry[0]][1]")
      zc=p.evaluate(f"()=>{{const Z=ZONES['{z}'];return{{x:(Z[1]+Z[3]/2)/100,y:(Z[2]+Z[4]/2)/100}}}}")
      walk_to(p, stick, zc['x'], zc['y'], timeout=5.0, rad=0.085)
      # wait for sequential drops
      for _ in range(10):
        still=p.evaluate(f"()=>{{const c=G.cur.state().carry;return c.some(k=>ITEMS[k][1]==='{z}')}}")
        if not still: break
        stick.steer(zc['x'], zc['y']); p.wait_for_timeout(220)
      stick.stop(); p.wait_for_timeout(250)
      continue
    p.wait_for_timeout(400)

  stick.stop()
  if p.query_selector('#cont'):
    p.click('#cont'); p.wait_for_timeout(500)
  st=p.evaluate('({done:!!G.S.done.prep1, placed:G.cur&&G.cur.state?G.cur.state().placed:null, grace:G.S.grace})')
  print('result', st, 'iters', safety)

  # overlap
  p.evaluate("G.start('prep1')"); dismiss(p); p.wait_for_timeout(250)
  bad=p.evaluate('''()=>{
    const zones=[...document.querySelectorAll('.zone')].map(z=>z.getBoundingClientRect());
    const strip=document.querySelector('.objstrip').getBoundingClientRect();
    const t=document.querySelector('#toast'); t.textContent='Not there — think: where is it used?'; t.style.opacity=1;
    const tr=t.getBoundingClientRect();
    const ov=(a,b)=>!(a.right<b.left||a.left>b.right||a.bottom<b.top||a.top>b.bottom);
    return {stripHit:zones.some(z=>ov(strip,z)), toastHit:zones.some(z=>ov(tr,z)), toastTop:tr.top};
  }''')
  print('overlap', bad)
  assert not bad['stripHit'] and not bad['toastHit'], bad

  p.screenshot(path='/workspace/v2-shots/v24-prep.png')
  print('ERRORS', errs)
  assert not errs, errs
  assert st['done'], 'Mass Prep did not complete via drag'
  print('PASS')
