import sys
from playwright.sync_api import sync_playwright
URL=sys.argv[1] if len(sys.argv)>1 else 'http://localhost:8765/'
errs=[];ok=True
def log(*a): print(*a)
with sync_playwright() as pw:
  b=pw.chromium.launch()
  for W,H in [(360,780),(412,915)]:
    p=b.new_page(viewport={'width':W,'height':H},has_touch=True)
    p.on('pageerror',lambda e: errs.append(str(e)));p.on('console',lambda m: m.type=='error' and errs.append(m.text))
    p.goto(URL);p.evaluate('localStorage.clear()');p.reload();p.wait_for_timeout(800);p.evaluate('G.forceNear=1')
    def dl():
      while p.is_visible('#dlg'): p.tap('#dlg')
    def place():
      for i in range(25):
        if p.query_selector('#lostspot'):
          bb=p.query_selector('#lostspot').bounding_box(); assert 0<=bb['x'] and bb['x']+bb['width']<=W and bb['y']+bb['height']<=H, bb
        its=p.query_selector_all('[data-i]')
        if not its:
          if p.query_selector('#lostspot'): p.wait_for_timeout(8500); assert p.is_visible('#arrow'); p.screenshot(path=f'/workspace/v2-shots/narrow/{W}-glint-arrow.png'); p.tap('#lostspot'); continue
          break
        its[0].tap(); z=p.evaluate("ITEMS[document.querySelector('.it.sel').dataset.i][1]"); p.tap(f'[data-z={z}]')
      p.wait_for_selector('#cont',timeout=3000); p.screenshot(path=f'/workspace/v2-shots/narrow/{W}-mass-ready.png'); p.tap('#cont'); p.tap('#bk')
    dl(); p.tap('[data-m=prep1]'); dl(); assert not p.query_selector('#lostspot'),'lost in first prep'; place()
    r1=p.evaluate('G.S.done.prep1'); log(W,'prep1',r1)
    # forced missing item (setup only), replay prep1
    p.evaluate('G.forceLost=1'); p.tap('[data-m=prep1]'); dl(); assert p.query_selector('#lostspot'); place(); p.evaluate('G.forceLost=0'); log(W,'prep-missing ok')
    # exorcism: unlock prerequisites by save state (setup), then real taps
    p.evaluate("G.S.done.bells=1;localStorage.setItem('asg2',JSON.stringify(G.S))"); p.reload(); p.wait_for_timeout(600); dl()
    p.tap('[data-m=house]'); dl()
    for i in range(60):
      if p.query_selector('#bk'): break
      bs=[x for x in p.query_selector_all('[data-s]') if x.is_enabled()]
      if bs: bs[-1].tap()
      p.wait_for_timeout(1000)
    p.wait_for_selector('#bk',timeout=5000); log(W,'house',p.evaluate('G.S.done.house')); p.tap('#bk')
    p.tap('[data-m=proc]'); dl()
    for i in range(400):
      if p.query_selector('#bk'): break
      st=p.evaluate('G.cur.state()'); lane=st['lane']
      danger={o['l'] for o in st['obs'] if o['k']>=0 and not o['d'] and .5<o['y']<.86}
      if lane in danger:
        tgt=[l for l in (lane-1,lane+1) if 0<=l<=2 and l not in danger]
        if tgt: p.tap('#pl' if tgt[0]<lane else '#pr')
      p.wait_for_timeout(40)
    p.wait_for_selector('#bk',timeout=5000); log(W,'proc',p.evaluate('G.S.done.proc')); p.tap('#bk')
    ok=ok and all(p.evaluate('[G.S.done.prep1,G.S.done.house,G.S.done.proc]'))
  print('ALLDONE',ok,'ERRORS',errs)
