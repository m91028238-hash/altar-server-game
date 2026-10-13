import sys
from playwright.sync_api import sync_playwright
URL=sys.argv[1] if len(sys.argv)>1 else 'http://localhost:8765/'
errs=[]
with sync_playwright() as pw:
  b=pw.chromium.launch()
  for vp in [{'width':390,'height':844},{'width':1280,'height':800}]:
    p=b.new_page(viewport=vp,has_touch=True)
    p.on('console',lambda m: m.type=='error' and errs.append(m.text)); p.on('pageerror',lambda e: errs.append(str(e)))
    p.goto(URL); p.evaluate('localStorage.clear()'); p.reload(); p.wait_for_timeout(1000); p.evaluate('G.forceNear=1')
    tag='' if vp['width']<500 else '-desktop'
    def dl():
      while p.is_visible('#dlg'): p.click('#dlg')
    dl(); p.screenshot(path=f'/workspace/v2-shots/hub{tag}.png')
    p.click('[data-m=prep1]'); dl(); p.wait_for_timeout(300)
    p.screenshot(path=f'/workspace/v2-shots/mass-prep{tag}.png')
    if p.query_selector('#lostspot'): p.click('#lostspot')
    for i in range(20):
      it=p.query_selector('[data-i]')
      if not it: break
      it.click(); z=p.evaluate("ITEMS[document.querySelector('.it.sel').dataset.i][1]"); p.click(f'[data-z={z}]'); p.wait_for_timeout(50)
    p.click('#cont'); p.wait_for_timeout(300); print(vp['width'],'prep1',p.evaluate('!!G.S.done.prep1')); p.click('#bk')
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
