import sys
from playwright.sync_api import sync_playwright
URL=sys.argv[1] if len(sys.argv)>1 else 'http://localhost:8765/'
errs=[]
with sync_playwright() as pw:
  b=pw.chromium.launch()
  for vp in [{'width':390,'height':844},{'width':1280,'height':800}]:
    p=b.new_page(viewport=vp,has_touch=True)
    p.on('console',lambda m: m.type=='error' and errs.append(m.text)); p.on('pageerror',lambda e: errs.append(str(e)))
    p.goto(URL); p.evaluate('localStorage.clear()'); p.reload(); p.wait_for_timeout(1000); 
    tag='' if vp['width']<500 else '-desktop'
    def dl():
      while p.is_visible('#dlg'): p.click('#dlg')
    dl(); p.screenshot(path=f'/workspace/v2-shots/hub{tag}.png')
    p.click('[data-m=prep1]'); dl(); p.wait_for_timeout(300)
    p.screenshot(path=f'/workspace/v2-shots/mass-prep{tag}.png')
    # v2.4 free-move prep: complete via injected joystick steering
    p.evaluate("""()=>{const c=G.cur; if(!c||c.type!='prep')return; const st=c.state; const iv=setInterval(()=>{const s=c.state(); if(s.done||document.querySelector('#cont')){clearInterval(iv);return}
      const left=s.shelf.filter(it=>!it.gone); const J=c.joy; if(!J)return;
      let tx,ty; if(s.carry.length>=3||(s.carry.length&&!left.length)){const z=ITEMS[s.carry[0]][1],Z=ZONES[z];tx=(Z[1]+Z[3]/2)/100;ty=(Z[2]+Z[4]/2)/100}
      else if(left.length){const it=left[0];tx=it.x;ty=it.y}else return;
      const dx=tx-s.px,dy=ty-s.py,n=Math.hypot(dx,dy)||1; J.joy.on=1; J.joy.x=dx/n; J.joy.y=dy/n;
    },50); setTimeout(()=>clearInterval(iv),120000)}""")
    p.wait_for_selector('#cont',timeout=90000); p.click('#cont'); p.wait_for_timeout(300); print(vp['width'],'prep1',p.evaluate('!!G.S.done.prep1')); p.click('#bk')
    for id in ['bells','house','proc','cross','hosp']:
      p.evaluate(f"G.S.xp=Math.max(G.S.xp,500);G.S.done.feast=1;G.start('{id}')"); dl(); p.wait_for_timeout(500)
      if id=='house': p.click('[data-s=ourfather]'); p.wait_for_timeout(1300); p.screenshot(path=f'/workspace/v2-shots/exorcism{tag}.png')
      if id=='bells': p.wait_for_timeout(1500); p.screenshot(path=f'/workspace/v2-shots/bells{tag}.png')
      if id=='proc': p.wait_for_timeout(1500); p.screenshot(path=f'/workspace/v2-shots/procession{tag}.png')
      p.evaluate('G.cur.auto()'); p.wait_for_timeout(2600)
      print(id,p.evaluate(f"!!G.S.done['{id}']"))
      if p.query_selector('#bk'): p.click('#bk')
    p.screenshot(path=f'/workspace/v2-shots/hub-unlocked{tag}.png')
    p.click('#bchar'); p.screenshot(path=f'/workspace/v2-shots/character{tag}.png'); p.click('#bk')
    p.click('#bshop'); p.click('[data-k=rosary]'); p.screenshot(path=f'/workspace/v2-shots/shop{tag}.png')
    print('owned',p.evaluate('G.S.owned'))
  print('ERRORS',errs)
