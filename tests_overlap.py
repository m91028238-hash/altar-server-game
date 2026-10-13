import sys
from playwright.sync_api import sync_playwright
URL=sys.argv[1] if len(sys.argv)>1 else 'http://localhost:8765/'
JS='''()=>{const sel='.pill,.log,.btn,.zone,#dlg:not(.hide),.it,.bar,.node';const els=[...document.querySelectorAll(sel)].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.height&&getComputedStyle(e).visibility!='hidden'&&!e.closest('.panel')||e.matches('.panel .btn')&&false});
const bad=[];const vw=innerWidth,vh=innerHeight;
for(const e of els){const r=e.getBoundingClientRect();if(r.left<-1||r.right>vw+1)bad.push('offscreen-x:'+e.className+':'+e.textContent.slice(0,30));if(e.scrollWidth>e.clientWidth+2&&!e.matches('.bar'))bad.push('clipped:'+e.textContent.slice(0,30))}
for(let i=0;i<els.length;i++)for(let j=i+1;j<els.length;j++){const a=els[i],b=els[j];if(a.contains(b)||b.contains(a)||a.id=='dlg'||b.id=='dlg')continue;const r=a.getBoundingClientRect(),q=b.getBoundingClientRect();const w=Math.min(r.right,q.right)-Math.max(r.left,q.left),h=Math.min(r.bottom,q.bottom)-Math.max(r.top,q.top);if(w>2&&h>2)bad.push('overlap: ['+(a.className||a.id)+'] '+a.textContent.slice(0,25)+' <> ['+(b.className||b.id)+'] '+b.textContent.slice(0,25))}
// panel inner: buttons vs buttons in panels
return bad}'''
fails=0
with sync_playwright() as pw:
  b=pw.chromium.launch()
  for vp in [(360,780),(412,915),(1280,800)]:
    p=b.new_page(viewport={'width':vp[0],'height':vp[1]},has_touch=True)
    p.goto(URL);p.evaluate('localStorage.clear()');p.reload();p.wait_for_timeout(800)
    def chk(name):
      global fails
      r=p.evaluate(JS); 
      if r: fails+=1;print(vp,name,r[:6])
      p.screenshot(path=f'/workspace/v2-shots/narrow/{vp[0]}-{name}.png')
    chk('dialogue')
    while p.is_visible('#dlg'): p.click('#dlg')
    chk('map')
    p.evaluate("G.S.done={prep1:1,bells:1,house:1,proc:1};G.S.xp=500;G.S.sp=3;G.S.grace=999;G.S.seen={intro:1,feast:1,bells:1,house:1,proc:1,cross:1,hosp:1}")
    p.evaluate("G.start('feast')");p.wait_for_timeout(400);chk('prep')
    p.click('#bk') if p.query_selector('#bk') else p.evaluate('G.hub()')
    p.evaluate("G.start('bells')");p.wait_for_timeout(2500);chk('bells');p.evaluate("G.cur.auto()");p.wait_for_timeout(1200);p.click('#bk')
    for d in ['house','cross','hosp']:
      p.evaluate(f"G.start('{d}')");p.wait_for_timeout(400);p.click('[data-s=ourfather]');p.wait_for_timeout(1300);chk('battle-'+d);p.evaluate("G.cur.auto()");p.wait_for_timeout(2600);p.click('#bk')
    p.evaluate("G.start('proc')");p.wait_for_timeout(1500);chk('procession');p.evaluate("G.cur.auto()");p.wait_for_timeout(500);p.click('#bk')
    p.click('#bshop');chk('shop');p.click('#bk');p.click('#bchar');chk('character');p.click('#bk')
  print('FAILS',fails)
