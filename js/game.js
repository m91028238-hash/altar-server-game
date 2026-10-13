'use strict';
const $=s=>document.querySelector(s), cv=$('#cv'), cx=cv.getContext('2d'), UI=$('#ui'), HUD=$('#hud');
const IMG={};const load=n=>{const i=new Image();i.src='assets/'+n;IMG[n.split('.')[0]]=i;return i};
['church.jpg','sacristy.jpg','hub.jpg','house.jpg','crossroads.jpg','hospital.jpg','server.webp','priest.webp','seminarian.webp','demon.webp','frame.webp'].forEach(load);
Object.keys(ITEMS).concat(['rosary','scapular','medal','vestment','sword']).forEach(k=>load('i_'+k+'.webp'));
// ---------- save ----------
const DEF={xp:0,grace:0,sp:0,lvl:1,done:{},skills:['ourfather','hailmary','water'],owned:[],eq:[],base:{faith:60,dev:3,wis:3},seen:{},mute:0,slot:0};
let S;function loadS(raw){try{return Object.assign({},DEF,JSON.parse(raw||'{}'),{base:Object.assign({},DEF.base,(JSON.parse(raw||'{}').base||{}))})}catch(e){return Object.assign({},DEF,{base:{...DEF.base}})}}
S=loadS(localStorage.getItem('asg2'));
const save=()=>{localStorage.setItem('asg2',JSON.stringify(S));if(S.slot>=0)localStorage.setItem('asg2_slot'+S.slot,JSON.stringify(S))};
const rank=()=>{let r=0;RANKS.forEach((k,i)=>{if(S.xp>=k[1])r=i});return r};
function stats(){const s={faith:S.base.faith,dev:S.base.dev,wis:S.base.wis,guard:0,water:0};S.eq.forEach(k=>{const e=SHOP[k][3];for(const a in e)s[a]=(s[a]||0)+e[a]});s.faith+=rank()*12;return s}
function gain(xp,gr){const r0=rank(),st=stats();xp=Math.round(xp*(1+st.wis*.05));S.xp+=xp;S.grace+=gr;
 const nl=1+Math.floor(S.xp/80);if(nl>S.lvl){S.sp+=nl-S.lvl;S.lvl=nl;toast('Level '+nl+'! +Skill point');sfx('lvl')}
 const r1=rank();if(r1>r0){toast('Advanced: '+RANKS[r1][0]+'!');sfx('lvl');
  if(r1===3&&!S.seen.priest){S.seen.priest=1;setTimeout(()=>talk(STORY.priest),400)}
  if(r1===7&&!S.seen.cardinal){S.seen.cardinal=1;setTimeout(()=>ending(),500)}}
 save();return xp}
function ending(){scene={bg:'hub',draw:()=>spr(IMG.priest,W*.5,H*.4,H*.18)};hud();
 h(`<div class="center"><div class="panel" style="text-align:center"><h2>Created Cardinal</h2><p>${STORY.end[0]}</p><p>Game 1 complete — your save remains; replay missions anytime.</p><button class="btn" id="bk">Return to Map</button></div></div>`);
 $('#bk').onclick=hub;burst(W/2,H*.4,'255,230,150',80,6);sfx('lvl')}
// ---------- audio ----------
let AC,bgmT=0,bgmOn=0;function tone(f,d=.15,type='sine',v=.2,when=0){try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();const o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime+when;o.type=type;o.frequency.value=f;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g).connect(AC.destination);o.start(t);o.stop(t+d)}catch(e){}}
function sfx(k){if(S.mute)return;({ok:()=>{tone(660,.12);tone(880,.2,'sine',.15,.08)},bad:()=>tone(160,.25,'square',.08),bell:()=>{[1320,1760,2093].forEach((f,i)=>tone(f,.9,'triangle',.12,i*.02))},lvl:()=>[523,659,784,1046].forEach((f,i)=>tone(f,.3,'sine',.15,i*.1)),hit:()=>tone(220,.3,'sawtooth',.08),holy:()=>[392,494,587,784].forEach((f,i)=>tone(f,.6,'sine',.1,i*.05)),tap:()=>tone(500,.05,'sine',.1)})[k]?.()}
function bgmTick(){if(S.mute||!bgmOn)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();const notes=[262,330,392,523,392,330],f=notes[bgmT++%notes.length];const o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime;o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(.03,t);g.gain.exponentialRampToValueAtTime(.001,t+1.1);o.connect(g).connect(AC.destination);o.start(t);o.stop(t+1.2)}catch(e){}}
setInterval(bgmTick,900);
function toggleMute(){S.mute=S.mute?0:1;save();toast(S.mute?'Music muted':'Music on');hud(HUD._extra||'')}
// ---------- render/particles ----------
let W,H,DPR;function rs(){DPR=Math.min(2,devicePixelRatio||1);W=innerWidth;H=innerHeight;cv.width=W*DPR;cv.height=H*DPR;cx.setTransform(DPR,0,0,DPR,0,0)}addEventListener('resize',()=>{rs();document.documentElement.style.setProperty('--hh',HUD.offsetHeight+'px')});rs();
const P=[];function burst(x,y,col='255,215,120',n=24,sp=3){for(let i=0;i<n;i++){const a=Math.random()*6.28,v=Math.random()*sp+.5;P.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-1,l:1,c:col,r:2+Math.random()*4})}}
function cover(img,ay=.45){if(!img||!img.complete||!img.naturalWidth)return;const s=Math.max(W/img.naturalWidth,H/img.naturalHeight),w=img.naturalWidth*s,h=img.naturalHeight*s;cx.drawImage(img,(W-w)/2,(H-h)*ay,w,h)}
function spr(img,x,y,h,bob=0,flip){if(!img||!img.complete)return;const w=h*img.naturalWidth/img.naturalHeight;cx.save();cx.translate(x,y+Math.sin(T*3+bob)*3);if(flip)cx.scale(-1,1);cx.drawImage(img,-w/2,-h,w,h);cx.restore()}
let T=0,last=0,scene={bg:'hub',draw:null,tick:null};
function frame(t){const dt=Math.min(.05,(t-last)/1000||0);last=t;T+=dt;cx.clearRect(0,0,W,H);cover(IMG[scene.bg],scene.bg==='church'||scene.bg==='sacristy'?.35:.45);
 if(Math.random()<.3)P.push({x:Math.random()*W,y:H,vx:0,vy:-.4-Math.random()*.5,l:1.5,c:'255,225,160',r:1.5+Math.random()*2,m:1});
 scene.tick&&scene.tick(dt);scene.draw&&scene.draw();
 cx.globalCompositeOperation='lighter';for(let i=P.length-1;i>=0;i--){const p=P[i];p.x+=p.vx;p.y+=p.vy;if(!p.m)p.vy+=.05;p.l-=dt*(p.m?.3:1);if(p.l<=0){P.splice(i,1);continue}cx.fillStyle=`rgba(${p.c},${Math.min(1,p.l)})`;cx.beginPath();cx.arc(p.x,p.y,p.r,0,6.28);cx.fill()}cx.globalCompositeOperation='source-over';
 requestAnimationFrame(frame)}requestAnimationFrame(frame);
window.addEventListener('error',e=>console.error(e.message));
// ---------- UI helpers ----------
function toast(m){const t=$('#toast');t.textContent=m;t.style.opacity=1;clearTimeout(t._t);t._t=setTimeout(()=>t.style.opacity=0,1500)}
function hud(extra=''){HUD._extra=extra;const r=rank(),nx=RANKS[r+1];HUD.innerHTML=`<span class="pill">✝ ${RANKS[r][0]} · Lv${S.lvl}</span><span class="pill">XP ${S.xp}${nx?'/'+nx[1]:''}</span><span class="pill">Grace ${S.grace}</span><button class="pill mute" id="bmute" type="button">${S.mute?'🔇':'🎵'}</button>${extra}`;document.documentElement.style.setProperty('--hh',HUD.offsetHeight+'px');const b=$('#bmute');if(b)b.onclick=e=>{e.stopPropagation();toggleMute()}}
function talk(lines,cb){const d=$('#dlg');let i=0;d.classList.remove('hide');const show=()=>{$('#dlgtxt').textContent=lines[i]};show();d.onclick=()=>{sfx('tap');if(++i<lines.length)show();else{d.classList.add('hide');d.onclick=null;cb&&cb()}}}
const h=(s)=>{UI.innerHTML=s};
function result(title,xp,gr,ok,id){if(ok&&id)S.done[id]=1;const x=ok?gain(xp,gr):gain(Math.round(xp/4),0);burst(W/2,H/2,'255,230,150',60,5);sfx(ok?'lvl':'bad');scene.draw=null;scene.tick=null;save();
 const fin=ok&&id==='final';
 h(`<div class="center"><div class="panel" style="text-align:center"><h2>${title}</h2><p>${ok?(fin?'The vigil is complete.':'Mission complete!'):'Not this time — try again.'}</p><p>+${x} XP · +${ok?gr:0} Grace</p><button class="btn" id="bk">${fin?'Continue ▶':'Return to Parish'}</button></div></div>`);hud();
 $('#bk').onclick=()=>{if(fin)ending();else hub()}}
// ---------- HUB ----------
const unlocked=m=>(!m.req||S.done[m.req])&&(!m.rank||rank()>=m.rank);
function hub(){bgmOn=1;scene={bg:'hub',draw:()=>{spr(IMG[RANKS[rank()][2]],W*.5,H*.34,Math.min(100,H*.12),0)}};hud();
 let s=`<div class="gtitle">Game 1: Altar Server</div><div style="position:absolute;inset:0">`;
 MISSIONS.forEach(m=>{const u=unlocked(m);s+=`<div class="node ${u?'':'lock'}" style="left:${m.x}%;top:${m.y}%"><button class="btn sm" data-m="${m.id}" ${u?'':'disabled'}>${S.done[m.id]?'✓ ':u?'':'🔒 '}${m.t}</button></div>`});
 s+=`</div><div style="position:absolute;top:calc(var(--hh) + 28px);right:8px;display:flex;flex-direction:column;max-width:42%"><button class="btn sm" id="bshop">Sacristy Shop</button><button class="btn sm" id="bchar">Character${S.sp?' ('+S.sp+')':''}</button><button class="btn sm" id="bsave">Saves</button><button class="btn sm" id="breset">Reset</button></div>`;h(s);
 UI.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{sfx('tap');start(MISSIONS.find(m=>m.id==b.dataset.m))});
 $('#bshop').onclick=shop;$('#bchar').onclick=charScr;$('#bsave').onclick=saveScr;
 $('#breset').onclick=()=>{if(confirm('Erase current progress?')){localStorage.removeItem('asg2');S=loadS(null);save();location.reload()}};
 if(!S.seen.intro){S.seen.intro=1;save();talk(STORY.intro,()=>{if(!S.seen.howto){S.seen.howto=1;save();talk(STORY.howto)}})}
 else if(!S.seen.howto){S.seen.howto=1;save();talk(STORY.howto)}}
function start(m){const go=()=>({prep:prep,bells:bells,exo:exo,proc:proc})[m.type](m);if(STORY[m.id]&&!S.seen[m.id]){S.seen[m.id]=1;save();talk(STORY[m.id],go)}else go()}
// ---------- SAVES ----------
function saveScr(){scene={bg:'sacristy'};hud();
 const slots=[0,1,2].map(i=>{let raw=localStorage.getItem('asg2_slot'+i);let d=raw?loadS(raw):null;return d?`${RANKS[(()=>{let r=0;RANKS.forEach((k,j)=>{if(d.xp>=k[1])r=j});return r})()][0]} · Lv${d.lvl} · XP ${d.xp}`:'(empty)'});
 let s=`<div class="center"><div class="panel"><h2>Saves</h2><p>Autosave is always on. Pick a slot, or export a code.</p>`;
 slots.forEach((lab,i)=>{s+=`<div style="margin:8px 0;display:flex;gap:6px;flex-wrap:wrap;align-items:center"><b>Slot ${i+1}</b> <small>${lab}</small><button class="btn sm" data-sv="${i}">Save</button><button class="btn sm" data-ld="${i}">Load</button></div>`});
 s+=`<p><button class="btn sm" id="bexp">Export code</button> <button class="btn sm" id="bimp">Import code</button></p><textarea id="scode" rows="3" style="width:100%;font:12px monospace;background:#1a0e08;color:#fbeed2;border:1px solid #a77a22;border-radius:8px;padding:6px"></textarea><button class="btn" id="bk">Back</button></div></div>`;
 h(s);$('#bk').onclick=hub;
 UI.querySelectorAll('[data-sv]').forEach(b=>b.onclick=()=>{S.slot=+b.dataset.sv;save();toast('Saved to slot '+(+b.dataset.sv+1));saveScr()});
 UI.querySelectorAll('[data-ld]').forEach(b=>b.onclick=()=>{const raw=localStorage.getItem('asg2_slot'+b.dataset.ld);if(!raw){toast('Empty slot');return}S=loadS(raw);S.slot=+b.dataset.ld;save();toast('Loaded slot '+(+b.dataset.ld+1));hub()});
 $('#bexp').onclick=()=>{try{$('#scode').value=btoa(unescape(encodeURIComponent(JSON.stringify(S))));toast('Code ready — copy it')}catch(e){toast('Export failed')}};
 $('#bimp').onclick=()=>{try{const t=$('#scode').value.trim();if(!t){toast('Paste a code first');return}S=loadS(decodeURIComponent(escape(atob(t))));save();toast('Save imported');hub()}catch(e){toast('Invalid save code')}}}
// ---------- SHOP / CHARACTER ----------
function shop(){scene={bg:'sacristy'};hud();let s='<div class="center"><div class="panel"><h2>Sacristy Shop</h2><p>Offer Grace for sacramentals and vestments. (Tap owned items to equip/unequip.)</p><div class="grid">';
 for(const k in SHOP){const e=SHOP[k],own=S.owned.includes(k),eq=S.eq.includes(k);s+=`<div class="card"><img src="assets/i_${e[1]}.webp"><br><b>${e[0]}</b><br>${e[4]}<br><button class="btn sm" data-k="${k}">${eq?'Unequip':own?'Equip':'Buy '+e[2]}</button></div>`}
 h(s+'</div><button class="btn" id="bk">Back</button></div></div>');$('#bk').onclick=hub;
 UI.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{const k=b.dataset.k;if(S.owned.includes(k)){S.eq.includes(k)?S.eq.splice(S.eq.indexOf(k),1):S.eq.push(k)}else if(S.grace>=SHOP[k][2]){S.grace-=SHOP[k][2];S.owned.push(k);S.eq.push(k);sfx('ok');burst(W/2,H/2)}else{sfx('bad');toast('Not enough Grace')}save();shop()})}
function charScr(){scene={bg:'sacristy',draw:()=>spr(IMG[RANKS[rank()][2]],W*.5,H*.27,H*.15)};hud();const st=stats();
 let s=`<div class="center"><div class="panel" style="margin-top:${H*.22}px"><h3>${RANKS[rank()][0]} — Level ${S.lvl}</h3><p>Faith ${st.faith} · Devotion ${st.dev} · Wisdom ${st.wis} · Guard ${st.guard}</p><p>Skill points: <b>${S.sp}</b></p><div class="grid">`;
 ['faith','dev','wis'].forEach(k=>s+=`<button class="btn sm" data-st="${k}" ${S.sp?'':'disabled'}>+ ${k=='dev'?'Devotion':k=='wis'?'Wisdom':'Faith'}</button>`);
 s+='</div><h4>Prayer tree</h4><div class="grid">';
 for(const k in SKILLS){const sk=SKILLS[k],has=S.skills.includes(k),req=sk.cost?(rank()>=sk.cost-1):1;s+=`<div class="card"><b>${sk.n}</b><br>${sk.d}<br>${has?'✓ Learned':`<button class="btn sm" data-sk="${k}" ${S.sp&&req?'':'disabled'}>Learn (1 pt${sk.cost>1?', Seminarian+':''})</button>`}</div>`}
 h(s+'</div><button class="btn" id="bk">Back</button></div></div>');$('#bk').onclick=hub;
 UI.querySelectorAll('[data-st]').forEach(b=>b.onclick=()=>{S.sp--;S.base[b.dataset.st]+=b.dataset.st=='faith'?10:1;save();sfx('ok');charScr()});
 UI.querySelectorAll('[data-sk]').forEach(b=>b.onclick=()=>{S.sp--;S.skills.push(b.dataset.sk);save();sfx('holy');charScr()})}
// ---------- MISSION: PREP ----------
function prep(m){const first=m.id=='prep1'&&!S.done.prep1;const diff=m.diff||0;
 let sea;if(m.sea)sea=SEASONS.find(s=>s.id===m.sea)||SEASONS[0];
 else if(m.id=='prep1')sea=SEASONS[0];
 else sea=SEASONS[1+Math.floor(Math.random()*Math.min(5,SEASONS.length-1))];
 let items=sea.items.slice();
 if(diff>=2){['thurible','boat','bell'].forEach(k=>{if(!items.includes(k)&&ITEMS[k])items.push(k)})}
 if(diff>=3){['water','corporal'].forEach(k=>{if(!items.includes(k))items.push(k)})}
 items=items.sort(()=>Math.random()-.5);const total=items.length;
 const lost=window.G.forceLost?items[0]:(!first&&Math.random()<.7?items[Math.floor(Math.random()*items.length)]:null);
 const spots=[[16,46],[84,46],[24,74],[46,72]],sp=spots[Math.random()*spots.length|0],lx=sp[0]/100,ly=sp[1]/100;
 let placed=0,mist=0,sel=null,found=!lost,time=Math.max(40,75+stats().wis*4-diff*12),t0=T,done=0;
 let px=.18,py=.86,tx=null,ty=null,pendingZ=null,keys={},joy={on:0,x:0,y:0},facing=0;
 const spd=.45;
 scene={bg:'church',tick:dt=>{if(done)return;time-=dt;if(time<=0){done=1;fin(false);return}
   let vx=(keys.r?1:0)-(keys.l?1:0),vy=(keys.d?1:0)-(keys.u?1:0);
   if(joy.on){vx+=joy.x;vy+=joy.y}
   if(tx!=null){const dx=tx-px,dy=ty-py,len=Math.hypot(dx,dy);if(len>.025){vx+=dx/len;vy+=dy/len}else{tx=ty=null;if(pendingZ&&sel&&ITEMS[sel][1]==pendingZ&&near(pendingZ)){const z=pendingZ;pendingZ=null;placed++;burst(px*W,py*H);sfx('ok');items=items.filter(k=>k!=sel);sel=null;if(!items.length){ready();return}draw()}}}
   const n=Math.hypot(vx,vy);if(n>.01){px=Math.max(.06,Math.min(.94,px+vx/n*spd*dt));py=Math.max(.38,Math.min(.92,py+vy/n*spd*dt));facing=vx}
  },draw:()=>{spr(IMG.server,px*W,py*H,H*.16,0,facing<0);spr(IMG.priest,W*.85,H*.42,H*.14,1);if(!found){const a=.5+.5*Math.sin(T*5);const g=cx.createRadialGradient(lx*W,ly*H,2,lx*W,ly*H,50);g.addColorStop(0,`rgba(255,250,200,${.6+a*.4})`);g.addColorStop(1,'rgba(255,220,120,0)');cx.fillStyle=g;cx.beginPath();cx.arc(lx*W,ly*H,50,0,6.28);cx.fill();if(Math.random()<.2)burst(lx*W,ly*H,'255,240,180',2,1.5)}}};
 function fin(ok){done=1;scene.tick=null;unbindMove();result(sea.n+' Prep',30+placed*5-mist*3+diff*10,10+placed*3+diff*2,ok,m.id)}
 function ready(){done=1;unbindMove();sfx('lvl');burst(W/2,H*.45,'255,240,180',70,5);h(`<div class="center"><div class="panel" style="text-align:center"><h2>Mass is ready!</h2><p>Every item is in its place. Fr. Thomas smiles.</p><button class="btn" id="cont">Continue ▶</button></div></div>`);$('#cont').onclick=()=>fin(true)}
 function near(z){const Z=ZONES[z],zx=(Z[1]+Z[3]/2)/100,zy=(Z[2]+Z[4]/2)/100;return Math.hypot(px-zx,py-zy)<.28}
 function draw(){if(done)return;hud(`<span class="pill" style="border-color:${sea.c}">${sea.n}</span><span class="pill" id="tmr">⏱ ${Math.ceil(time)}</span><span class="pill">${placed}/${total}</span>`);
  let s=`<div id="walk"></div>`;for(const z in ZONES){const Z=ZONES[z];s+=`<div class="zone" data-z="${z}" style="left:${Z[1]}%;top:${Z[2]}%;width:${Z[3]}%;height:${Z[4]}%">${Z[0]}</div>`}
  s+=`<div class="log">${sel?'Place: <b>'+ITEMS[sel][0]+'</b>':'Tap an item, walk (drag/WASD/tap), then the zone.'}${!found?'<br>✨ The '+ITEMS[lost][0]+' is missing! Tap the glowing glint.':''}</div><div class="tray">`;
  items.forEach(k=>{if(k==lost&&!found)return;s+=`<div class="it ${sel==k?'sel':''}" data-i="${k}"><img src="assets/i_${k}.webp" alt="${ITEMS[k][0]}" title="${ITEMS[k][0]}"></div>`});
  s+='</div>';if(!found)s+=`<button id="lostspot" aria-label="glint" style="left:${sp[0]}vw;top:${sp[1]}vh"></button><div id="arrow" class="${T-t0>8?'':'hide'}" style="left:${sp[0]}vw;top:calc(${sp[1]}vh - 70px)">⬇</div>`;
  h(s);
  UI.querySelectorAll('[data-i]').forEach(e=>e.onclick=ev=>{ev.stopPropagation();sel=e.dataset.i;sfx('tap');draw()});
  UI.querySelectorAll('[data-z]').forEach(e=>e.onclick=ev=>{ev.stopPropagation();if(!sel)return;
   if(ITEMS[sel][1]==e.dataset.z){if(!(window.G.forceNear||near(e.dataset.z))){const Z=ZONES[e.dataset.z];tx=(Z[1]+Z[3]/2)/100;ty=(Z[2]+Z[4]/2)/100;pendingZ=e.dataset.z;sfx('tap');toast('Walking to the zone…');return}placed++;burst(ev.clientX,ev.clientY);sfx('ok');items=items.filter(k=>k!=sel);sel=null;if(!items.length){ready();return}}
   else{mist++;time-=3;sfx('bad');toast('Not there — think: where is it used?')}draw()});
  const ls=$('#lostspot');if(ls)ls.onclick=ev=>{ev.stopPropagation();found=true;sfx('ok');burst(lx*W,ly*H,'255,240,180',40);toast('Found the '+ITEMS[lost][0]+'!');draw()};
  bindWalk()}
 const onKey=e=>{const k=e.key.toLowerCase();if(['arrowleft','a'].includes(k))keys.l=e.type==='keydown';if(['arrowright','d'].includes(k))keys.r=e.type==='keydown';if(['arrowup','w'].includes(k))keys.u=e.type==='keydown';if(['arrowdown','s'].includes(k))keys.d=e.type==='keydown'};
 function bindWalk(){const w=$('#walk');if(!w)return;let sx,sy,moved;
  w.onpointerdown=ev=>{if(ev.target!==w)return;w.setPointerCapture(ev.pointerId);sx=ev.clientX;sy=ev.clientY;moved=0;joy.on=1;joy.x=0;joy.y=0};
  w.onpointermove=ev=>{if(!joy.on)return;const dx=ev.clientX-sx,dy=ev.clientY-sy;if(Math.hypot(dx,dy)>12)moved=1;const m=80;joy.x=Math.max(-1,Math.min(1,dx/m));joy.y=Math.max(-1,Math.min(1,dy/m));tx=ty=null};
  w.onpointerup=ev=>{joy.on=0;joy.x=0;joy.y=0;if(!moved){tx=ev.clientX/W;ty=ev.clientY/H}sx=sy=null};
  w.onpointercancel=()=>{joy.on=0}}
 function unbindMove(){removeEventListener('keydown',onKey);removeEventListener('keyup',onKey);keys={}}
 addEventListener('keydown',onKey);addEventListener('keyup',onKey);
 if(sea.note)toast(sea.note);draw();const iv=setInterval(()=>{if(done||scene.tick==null){clearInterval(iv);return}const p=$('#tmr');if(p)p.textContent='⏱ '+Math.ceil(time);const ar=$('#arrow');if(ar&&T-t0>8)ar.classList.remove('hide')},250);
 window.G.cur={type:'prep',state:()=>({items,lost,found,done,px,py}),walkTo:(x,y)=>{tx=x;ty=y}}}
// ---------- MISSION: BELLS ----------
function bells(m){const diff=m.diff||0;const cues=['Epiclesis','Elevation of the Host','Elevation of the Host','Elevation of the Chalice','Elevation of the Chalice','Ecce Agnus Dei'];let notes=[],t0=T+2,score=0,hits=0,idx=0;
 cues.forEach((c,i)=>notes.push({t:t0+i*(1.6-diff*.12)+Math.random()*.4,c,st:0}));const lineY=()=>H*.72,speed=()=>H*(.35+diff*.04),win=.18+stats().wis*.01-diff*.02;
 scene={bg:'church',tick:()=>{notes.forEach(n=>{if(!n.st&&T-n.t>win){n.st=2;toast('Missed: '+n.c);sfx('bad')}});if(notes.every(n=>n.st)&&scene.tick){scene.tick=null;setTimeout(()=>result('Consecration Bells',20+score+diff*8,8+hits*3,hits>=4,m.id),600)}},
  draw:()=>{spr(IMG.priest,W*.5,H*.42,H*.15);spr(IMG.server,W*.25,H*.9,H*.14);cx.strokeStyle='rgba(255,215,120,.9)';cx.lineWidth=4;cx.beginPath();cx.arc(W/2,lineY(),40,0,6.28);cx.stroke();
   notes.forEach(n=>{if(n.st)return;const y=lineY()-(n.t-T)*speed();if(y<-50)return;const g=cx.createRadialGradient(W/2,y,4,W/2,y,40);g.addColorStop(0,'rgba(255,240,180,1)');g.addColorStop(1,'rgba(255,200,80,0)');cx.fillStyle=g;cx.beginPath();cx.arc(W/2,y,40,0,6.28);cx.fill();if(IMG.i_bell.complete)cx.drawImage(IMG.i_bell,W/2-22,y-22,44,44);cx.fillStyle='#fff';cx.font='14px Georgia';cx.textAlign='center';cx.fillText(n.c,W/2,y-46)})}};
 hud();h(`<div class="log">Ring when the bell reaches the golden ring! (tap anywhere / Space)</div><div id="tapz" style="position:absolute;inset:0"></div>`);
 const ring=()=>{const n=notes.find(n=>!n.st);if(!n)return;const d=Math.abs(T-n.t);sfx('bell');if(d<win){n.st=1;hits++;const p=d<win/2;score+=p?15:8;toast(p?'Perfect!':'Good');burst(W/2,lineY(),'255,230,150',p?40:20)}else if(n.t-T<.6){toast('Too '+(T<n.t?'early':'late'));}};
 $('#tapz').onpointerdown=ring;const kd=e=>{if(e.code=='Space'&&scene.tick)ring()};addEventListener('keydown',kd);
 window.G.cur={type:'bells',auto:()=>{notes.forEach(n=>n.st=1);hits=6;score=60}}}
// ---------- MISSION: EXORCISM (turn-based) ----------
function exo(m){const D0=DEMONS[m.demon],diff=m.diff||0,st=stats();const D=[D0[0],Math.round(D0[1]*(1+diff*.25)),Math.round(D0[2]*(1+diff*.15)),D0[3]];
 let hp=D[1],mhp=D[1],fa=st.faith,mf=st.faith,cd={},uses={water:2+st.water},buff=0,stun=0,busy=0,shake=0,log='Fr. Thomas begins: "In the name of the Father, and of the Son, and of the Holy Spirit."';
 scene={bg:D[3],tick:dt=>{shake=Math.max(0,shake-dt*2)},draw:()=>{const dx=Math.sin(T*40)*shake*10;cx.globalAlpha=.6+.4*(hp/mhp);spr(IMG.demon,W*.5+dx,H*.5,H*.3*(.7+.3*hp/mhp),0);cx.globalAlpha=1;spr(IMG.priest,W*.28,H*.84,H*.2,1);spr(IMG[RANKS[rank()][2]],W*.72,H*.86,H*.17,2,true)}};
 function draw(){hud();let s=`<div class="log" style="text-align:left"><b>${D[0]}</b><div class="bar"><i style="width:${hp/mhp*100}%"></i></div><small>Your Faith ${Math.max(0,fa)}/${mf}</small><div class="bar f"><i style="width:${Math.max(0,fa)/mf*100}%"></i></div><p style="margin:6px 0 0">${log}</p></div><div class="skills">`;
  S.skills.forEach(k=>{const sk=SKILLS[k],c=cd[k]||0,u=k=='water'?` (${uses.water})`:'';s+=`<button class="btn sm" data-s="${k}" ${busy||c||(k=='water'&&!uses.water)?'disabled':''}>${sk.n}${u}${c?' ⏳'+c:''}</button>`});h(s+'</div>');
  UI.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>act(b.dataset.s))}
 function act(k){const sk=SKILLS[k];busy=1;let p=Math.round(sk.pow*(1+st.dev*.06)*(buff?1.5:1));if(buff&&k!='rosary')buff--;if(k=='water')uses.water--;
  hp-=p;if(sk.heal)fa=Math.min(mf,fa+sk.heal);if(sk.buff)buff=2;if(sk.stun)stun=1;cd[k]=sk.cd;for(const c in cd)if(c!=k&&cd[c])cd[c]--;
  sfx('holy');shake=1;burst(W*.5,H*.4,k=='water'?'150,210,255':'255,230,150',40,5);log=`You pray: <i>${sk.n}</i>. Through God's power the spirit recoils (−${p}).`;draw();
  setTimeout(()=>{if(hp<=0){log='Fr. Thomas: "Begone, in the name of Jesus Christ!" — the spirit departs. Peace returns. Thanks be to God.';burst(W/2,H*.4,'255,255,220',90,7);sfx('lvl');draw();setTimeout(()=>result(D[0]+' — Freed',60+mhp/2|0,25+mhp/4|0,true,m.id),1400);return}
   if(stun){stun=0;log='The spirit cannot bear the sight of the Cross and cowers.'}else{const atk=['whispers doubt','stirs up fear','mocks your sins','hurls a cold wind'][Math.random()*4|0],dmg=Math.max(1,D[2]+(Math.random()*5|0)-st.guard);fa-=dmg;sfx('hit');log=`The spirit ${atk} (−${dmg} Faith). Fr. Thomas: "Hold fast — Christ has already won."`}
   busy=0;if(fa<=0){result('Retreat & Pray',30,0,false);toast('Go to Confession, rest, strengthen your faith, and return.');return}draw()},900)}
 draw();window.G.cur={type:'exo',auto:()=>{hp=1;act('ourfather')}}}
// ---------- MISSION: PROCESSION (lane runner) ----------
function proc(m){const diff=m.diff||0;let lane=1,dist=0,goal=60+diff*25,obs=[],hitc=0,inc=0,spawn=0,over=0;const LX=l=>W*(.25+l*.25);
 const kinds=[['Dropped kneeler','#6b3a1c'],['Puddle','#4a7ab0'],['Stray dog','#a0703a'],['Fallen candle','#eee']];
 scene={bg:'crossroads',tick:dt=>{if(over)return;dist+=dt*6;spawn-=dt;if(spawn<=0){spawn=.9-Math.min(.45,dist/200)-diff*.05;const r=Math.random();obs.push({l:Math.random()*3|0,y:-40,k:r<.22?-1:Math.random()*4|0})}
   obs.forEach(o=>{o.y+=dt*H*(.35+diff*.03);if(!o.d&&o.y>H*.78&&o.y<H*.86&&o.l==lane){o.d=1;if(o.k<0){inc++;sfx('ok');burst(LX(lane),H*.8,'200,200,255')}else{hitc++;sfx('bad');toast(kinds[o.k][0]+'! Keep the cross steady');}}});obs=obs.filter(o=>o.y<H+50&&!(o.d&&o.k<0));
   if(dist>=goal){over=1;result('Corpus Christi Procession',50+inc*5-hitc*5+diff*10,20+inc*2,hitc<5,m.id)}if(hitc>=5){over=1;result('Procession',20,0,false)}},
  draw:()=>{cx.fillStyle='rgba(60,40,20,.35)';cx.fillRect(W*.12,0,W*.76,H);for(let i=0;i<3;i++){cx.strokeStyle='rgba(255,230,150,.2)';cx.beginPath();cx.moveTo(W*(.125+i*.25)+W*.125,0);cx.lineTo(W*(.125+i*.25)+W*.125,H);cx.stroke()}
   obs.forEach(o=>{if(o.d&&o.k>=0)return;if(o.k<0){cx.fillStyle='rgba(220,220,255,.8)';cx.beginPath();cx.arc(LX(o.l),o.y,14+Math.sin(T*6)*3,0,6.28);cx.fill()}else{cx.fillStyle=kinds[o.k][1];cx.beginPath();cx.ellipse(LX(o.l),o.y,30,18,0,0,6.28);cx.fill();cx.fillStyle='#fff';cx.font='11px Georgia';cx.textAlign='center';cx.fillText(kinds[o.k][0],LX(o.l),o.y-22)}});
   spr(IMG.i_cross,LX(lane),H*.74,H*.12);spr(IMG.server,LX(lane),H*.92,H*.14);spr(IMG.priest,LX(lane)+(W*.08),H*1.0,H*.12,1);
   const ps=$('#pst');if(ps)ps.textContent=`Route ${Math.min(100,dist/goal*100|0)}% · Incense ${inc} · Stumbles ${hitc}/5`}};
 hud();h(`<div class="log"><span id="pst"></span><br>Swipe / tap left-right (or arrow keys). Avoid obstacles, gather incense clouds.</div><div id="pl" style="position:absolute;left:0;top:0;bottom:0;width:50%"></div><div id="pr" style="position:absolute;right:0;top:0;bottom:0;width:50%"></div>`);
 $('#pl').onpointerdown=()=>lane=Math.max(0,lane-1);$('#pr').onpointerdown=()=>lane=Math.min(2,lane+1);
 const kd=e=>{if(e.key=='ArrowLeft')lane=Math.max(0,lane-1);if(e.key=='ArrowRight')lane=Math.min(2,lane+1)};addEventListener('keydown',kd);
 window.G.cur={type:'proc',state:()=>({lane,obs:obs.map(o=>({l:o.l,y:o.y/H,k:o.k,d:o.d}))}),auto:()=>{dist=goal}}}
window.G={get S(){return S},set S(v){S=v},hub,start:id=>start(MISSIONS.find(m=>m.id==id)),cur:null,save,loadS};
let imgsLeft=Object.keys(IMG).length;Object.values(IMG).forEach(i=>{const f=()=>{if(--imgsLeft==0)0};i.onload=f;i.onerror=()=>console.warn('img fail',i.src)});
hub();
