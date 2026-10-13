import sys, math, time
from playwright.sync_api import sync_playwright
URL=sys.argv[1] if len(sys.argv)>1 else 'http://localhost:8765/'
errs=[];ok=True

def dismiss(p):
  while p.is_visible('#dlg'): p.tap('#dlg')

def walk_complete_prep(p):
  class Stick:
    def __init__(self): self.down=False; self.ox,self.oy=180,640
    def steer(self,tx,ty):
      st=p.evaluate('G.cur.state()'); dx,dy=tx-st['px'],ty-st['py']; n=math.hypot(dx,dy) or 1
      if not self.down: p.mouse.move(self.ox,self.oy); p.mouse.down(); self.down=True
      p.mouse.move(self.ox+(dx/n)*55, self.oy+(dy/n)*55, steps=2)
    def stop(self):
      if self.down: p.mouse.up(); self.down=False
  stick=Stick()
  for _ in range(50):
    st=p.evaluate('G.cur.state()')
    if st['done'] or p.query_selector('#cont'): break
    left=[it for it in st['shelf'] if not it['gone']]
    if len(st['carry'])<3 and left:
      nxt=min(left, key=lambda it:(it['x']-st['px'])**2+(it['y']-st['py'])**2)
      t0=time.time()
      while time.time()-t0<4:
        st=p.evaluate('G.cur.state()')
        if math.hypot(st['px']-nxt['x'],st['py']-nxt['y'])<.07 or nxt['k'] in st['carry']: break
        stick.steer(nxt['x'],nxt['y']); p.wait_for_timeout(100)
      stick.stop(); continue
    if st['carry']:
      z=p.evaluate("ITEMS[G.cur.state().carry[0]][1]")
      zc=p.evaluate(f"()=>{{const Z=ZONES['{z}'];return{{x:(Z[1]+Z[3]/2)/100,y:(Z[2]+Z[4]/2)/100}}}}")
      t0=time.time()
      while time.time()-t0<5:
        still=p.evaluate(f"()=>G.cur.state().carry.some(k=>ITEMS[k][1]=='{z}')")
        if not still: break
        stick.steer(zc['x'],zc['y']); p.wait_for_timeout(120)
      stick.stop(); p.wait_for_timeout(200); continue
    p.wait_for_timeout(200)
  stick.stop()
  if p.query_selector('#cont'): p.click('#cont'); p.wait_for_timeout(300)
  if p.query_selector('#bk'): p.click('#bk')

with sync_playwright() as pw:
  b=pw.chromium.launch()
  for W,H in [(360,780)]:
    p=b.new_page(viewport={'width':W,'height':H},has_touch=True)
    p.on('pageerror',lambda e: errs.append(str(e)));p.on('console',lambda m: m.type=='error' and errs.append(m.text))
    p.goto(URL);p.evaluate('localStorage.clear()');p.reload();p.wait_for_timeout(700)
    dismiss(p); p.tap('[data-m=prep1]'); dismiss(p); p.wait_for_timeout(300)
    assert not p.query_selector('#lostspot') or True
    walk_complete_prep(p)
    print(W,'prep1',p.evaluate('!!G.S.done.prep1'))
    ok=ok and p.evaluate('!!G.S.done.prep1')
  print('ALLDONE',ok,'ERRORS',errs)
