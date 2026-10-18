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
const unlocked=m=>!m.req||S.done[m.req];
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

// ---------- JOYSTICK / FREE MOVE ----------
function makeJoy(){let keys={},joy={on:0,x:0,y:0,ox:0,oy:0},facing=0,unbound=0;
 const onKey=e=>{const k=e.key.toLowerCase();const down=e.type==='keydown';if(['arrowleft','a'].includes(k))keys.l=down;if(['arrowright','d'].includes(k))keys.r=down;if(['arrowup','w'].includes(k))keys.u=down;if(['arrowdown','s'].includes(k))keys.d=down;if(['arrowleft','arrowright','arrowup','arrowdown',' '].includes(e.key.toLowerCase())||['a','d','w','s'].includes(k))e.preventDefault()};
 addEventListener('keydown',onKey);addEventListener('keyup',onKey);
 function bind(el){if(!el)return;el.onpointerdown=ev=>{if(ev.button!=null&&ev.button!==0)return;ev.preventDefault();try{el.setPointerCapture(ev.pointerId)}catch(e){}joy.on=1;joy.ox=ev.clientX;joy.oy=ev.clientY;joy.x=0;joy.y=0;const b=$('#joybase'),k=$('#joyknob');if(b){b.classList.remove('hide');b.style.left=joy.ox+'px';b.style.top=joy.oy+'px';if(k){k.style.left='50%';k.style.top='50%'}}};
  el.onpointermove=ev=>{if(!joy.on)return;const dx=ev.clientX-joy.ox,dy=ev.clientY-joy.oy,m=56,len=Math.hypot(dx,dy)||1,c=Math.min(len,m);joy.x=dx/m;joy.y=dy/m;if(Math.hypot(joy.x,joy.y)>1){const n=Math.hypot(joy.x,joy.y);joy.x/=n;joy.y/=n}const k=$('#joyknob');if(k){k.style.left=`calc(50% + ${dx/len*c}px)`;k.style.top=`calc(50% + ${dy/len*c}px)`}};
  const up=()=>{joy.on=0;joy.x=0;joy.y=0;const b=$('#joybase');if(b)b.classList.add('hide')};
  el.onpointerup=up;el.onpointercancel=up;el.onlostpointercapture=up}
 function vel(){let vx=(keys.r?1:0)-(keys.l?1:0),vy=(keys.d?1:0)-(keys.u?1:0);if(joy.on){vx+=joy.x;vy+=joy.y}const n=Math.hypot(vx,vy);if(n>.01){vx/=n;vy/=n;facing=vx}else{vx=vy=0}return{vx,vy,n:Math.hypot(vx,vy)}}
 function unbind(){if(unbound)return;unbound=1;removeEventListener('keydown',onKey);removeEventListener('keyup',onKey);keys={};joy.on=0}
 return{keys,joy,get facing(){return facing},set facing(v){facing=v},bind,vel,unbind}}
function solidHit(nx,ny,solids,r=.028){for(const s of solids){if(nx>s.x-r&&nx<s.x+s.w+r&&ny>s.y-r&&ny<s.y+s.h+r)return s}return null}
function tryMove(px,py,vx,vy,spd,dt,solids){let nx=px+vx*spd*dt,ny=py+vy*spd*dt;nx=Math.max(.05,Math.min(.95,nx));ny=Math.max(.34,Math.min(.93,ny));
 if(solidHit(nx,py,solids))nx=px;if(solidHit(px,ny,solids))ny=py;if(solidHit(nx,ny,solids)){nx=px;ny=py}return{px:nx,py:ny}}
// ---------- MISSION: PREP ----------
function prep(m){const first=m.id=='prep1'&&!S.done.prep1;const diff=m.diff||0;
 let sea;if(m.sea)sea=SEASONS.find(s=>s.id===m.sea)||SEASONS[0];
 else if(m.id=='prep1')sea=SEASONS[0];
 else sea=SEASONS[1+Math.floor(Math.random()*Math.min(5,SEASONS.length-1))];
 let pool=sea.items.slice();
 if(diff>=2){['thurible','boat','bell'].forEach(k=>{if(!pool.includes(k)&&ITEMS[k])pool.push(k)})}
 if(diff>=3){['water','corporal'].forEach(k=>{if(!pool.includes(k))pool.push(k)})}
 pool=pool.sort(()=>Math.random()-.5);const total=pool.length,CAP=3;
 const lost=window.G.forceLost?pool[0]:(!first&&Math.random()<.7?pool[Math.floor(Math.random()*pool.length)]:null);
 const spots=[[16,46],[84,46],[24,74],[46,72]],sp=spots[Math.random()*spots.length|0];
 let placed=0,mist=0,found=!lost,time=Math.max(90,150+stats().wis*5-diff*10),t0=T,done=0,wrongCD=0,dropCD=0,coinT=0;
 let px=.5,py=.88,carry=[],flies=[],coins=[],J=makeJoy(),spd=.72;
 // shelf layout along sacristy table (bottom)
 const shelf=[];let si=0;pool.forEach(k=>{if(k===lost)return;const col=si%6,row=(si/6)|0;shelf.push({k,x:.12+col*.14,y:.78+row*.07,gone:0});si++});
 const solids=[{x:.42,y:.43,w:.16,h:.08},{x:.0,y:.30,w:1,h:.04},{x:.0,y:.72,w:.14,h:.10},{x:.86,y:.72,w:.14,h:.10}];
 function zoneRect(z){const Z=ZONES[z];return{x:Z[1]/100,y:Z[2]/100,w:Z[3]/100,h:Z[4]/100,cx:(Z[1]+Z[3]/2)/100,cy:(Z[2]+Z[4]/2)/100}}
 function inZone(z){const r=zoneRect(z);return px>r.x-.02&&px<r.x+r.w+.02&&py>r.y-.02&&py<r.y+r.h+.02}
 function nearPt(x,y,d=.07){return Math.hypot(px-x,py-y)<d}
 function objective(){if(!found&&lost)return{x:sp[0]/100,y:sp[1]/100,t:'Find the missing '+ITEMS[lost][0]};
  if(carry.length){const z=ITEMS[carry[0]][1],r=zoneRect(z);return{x:r.cx,y:r.cy,t:'Carry to '+ZONES[z][0]+' ('+carry.length+'/'+CAP+')'}}
  const next=shelf.find(it=>!it.gone);if(next)return{x:next.x,y:next.y,t:'Pick up items from the shelves'};
  return{x:.5,y:.5,t:'Mass is ready!'}}
 function spawnCoin(x,y,v=1){coins.push({x,y,v,vac:0})}
 function fin(ok){done=1;scene.tick=null;J.unbind();result(sea.n+' Prep',30+placed*5-mist*3+diff*10,10+placed*3+diff*2,ok,m.id)}
 function ready(){done=1;J.unbind();sfx('lvl');burst(W/2,H*.45,'255,240,180',70,5);h(`<div class="center"><div class="panel" style="text-align:center"><h2>Mass is ready!</h2><p>Every item is in its place. Fr. Thomas smiles.</p><button class="btn" id="cont">Continue ▶</button></div></div>`);$('#cont').onclick=()=>fin(true)}
 function ui(){const o=objective();hud(`<span class="pill" style="border-color:${sea.c}">${sea.n}</span><span class="pill" id="tmr">⏱ ${Math.ceil(time)}</span><span class="pill">${placed}/${total}</span><span class="pill">Hands ${carry.length}/${CAP}</span>`);
  let zs='';for(const z in ZONES){const Z=ZONES[z];zs+=`<div class="zone" data-z="${z}" style="left:${Z[1]}%;top:${Z[2]}%;width:${Z[3]}%;height:${Z[4]}%;pointer-events:none">${Z[0]}</div>`}
  h(`<div id="play" class="play"><div class="objstrip" id="obj">${o.t}</div>${zs}<div id="navarr">⬇</div><div id="joybase" class="hide"><div id="joyknob"></div></div></div>`);
  J.bind($('#play'))}
 ui();
 if(sea.note)toast(sea.note);
 scene={bg:'church',tick:dt=>{if(done)return;time-=dt;wrongCD=Math.max(0,wrongCD-dt);dropCD=Math.max(0,dropCD-dt);coinT-=dt;
  if(time<=0){fin(false);return}
  if(coinT<=0){coinT=4+Math.random()*3;spawnCoin(.15+Math.random()*.7,.55+Math.random()*.3,1)}
  const{vx,vy}=J.vel();if(vx||vy){const m=tryMove(px,py,vx,vy,spd,dt,solids);px=m.px;py=m.py;J.facing=vx||J.facing}
  // pick lost glint
  if(!found&&lost&&nearPt(sp[0]/100,sp[1]/100,.09)){found=1;sfx('ok');burst(sp[0]/100*W,sp[1]/100*H,'255,240,180',40);toast('Found the '+ITEMS[lost][0]+'!');
   if(carry.length<CAP){carry.push(lost);sfx('ok')}else shelf.push({k:lost,x:sp[0]/100,y:sp[1]/100,gone:0})}
  // pick shelf items
  for(const it of shelf){if(it.gone||carry.length>=CAP)continue;if(nearPt(it.x,it.y,.08)){it.gone=1;carry.push(it.k);sfx('ok');burst(it.x*W,it.y*H,'255,220,140',12,2)}}
  // drop in zones
  for(const z in ZONES){if(!inZone(z)||!carry.length||dropCD>0)continue;
   const match=carry.findIndex(k=>ITEMS[k][1]===z);
   if(match<0){if(wrongCD<=0){wrongCD=1.2;mist++;sfx('bad');toast('Not there — think: where is it used?')}continue}
   const k=carry.splice(match,1)[0];const r=zoneRect(z);dropCD=.35;
   flies.push({k,x:px,y:py,sx:px,sy:py,tx:r.cx,ty:r.cy,t:0});sfx('ok')}
  // fly anim complete
  for(let i=flies.length-1;i>=0;i--){const f=flies[i];f.t=Math.min(1,f.t+dt*3.2);const u=f.t*f.t*(3-2*f.t);f.x=f.sx+(f.tx-f.sx)*u;f.y=f.sy+(f.ty-f.sy)*u;
   if(f.t>=1){flies.splice(i,1);placed++;S.grace+=1;save();spawnCoin(f.tx,f.ty,1);burst(f.tx*W,f.ty*H,'255,230,150',28,4);
    const obj=$('#obj');if(obj)obj.textContent=objective().t;if(placed>=total&&!flies.length&&!carry.length&&shelf.every(it=>it.gone)&&found){ready();return}}}
  // vacuum coins
  for(let i=coins.length-1;i>=0;i--){const c=coins[i];const d=Math.hypot(px-c.x,py-c.y);if(d<.12||c.vac){c.vac=1;c.x+=(px-c.x)*dt*8;c.y+=(py-c.y)*dt*8;if(d<.04){coins.splice(i,1);S.grace+=c.v;save();burst(px*W,py*H,'255,215,100',8,2)}}}
  // HUD tick
  const tm=$('#tmr');if(tm)tm.textContent='⏱ '+Math.ceil(time);
  const obj=$('#obj');if(obj){const o=objective();if(obj.textContent!==o.t)obj.textContent=o.t}
  const ar=$('#navarr');if(ar){const o=objective();ar.style.left=(o.x*100)+'%';ar.style.top=(o.y*100-8)+'%'}
 },draw:()=>{
  // shelf items
  shelf.forEach(it=>{if(it.gone)return;const img=IMG['i_'+it.k];if(img&&img.complete)cx.drawImage(img,it.x*W-18,it.y*H-18,36,36);else{cx.fillStyle='#dcaf46';cx.fillRect(it.x*W-10,it.y*H-10,20,20)}});
  // coins
  coins.forEach(c=>{cx.fillStyle='#ffd36a';cx.beginPath();cx.arc(c.x*W,c.y*H,7+Math.sin(T*8),0,6.28);cx.fill();cx.strokeStyle='#a77a22';cx.stroke()});
  // lost glint
  if(!found&&lost){const lx=sp[0]/100*W,ly=sp[1]/100*H,a=.5+.5*Math.sin(T*5);const g=cx.createRadialGradient(lx,ly,2,lx,ly,50);g.addColorStop(0,`rgba(255,250,200,${.6+a*.4})`);g.addColorStop(1,'rgba(255,220,120,0)');cx.fillStyle=g;cx.beginPath();cx.arc(lx,ly,50,0,6.28);cx.fill()}
  spr(IMG.priest,W*.85,H*.42,H*.14,1);
  // player + carried stack wobble
  const sx=px*W,sy=py*H;spr(IMG.server,sx,sy,H*.15,0,J.facing<0);
  carry.forEach((k,i)=>{const img=IMG['i_'+k],wx=Math.sin(T*10+i)*4,wy=Math.sin(T*8+i*1.3)*3;const ix=sx+10+i*6+wx,iy=sy-H*.12-i*14+wy;if(img&&img.complete)cx.drawImage(img,ix-14,iy-14,28,28)});
  // flying drops
  flies.forEach(f=>{const img=IMG['i_'+f.k];if(img&&img.complete)cx.drawImage(img,f.x*W-16,f.y*H-16,32,32);burst(f.x*W,f.y*H,'255,230,150',1,.5)});
 }};
 window.G.cur={type:'prep',state:()=>({shelf:shelf.map(it=>({k:it.k,x:it.x,y:it.y,gone:it.gone})),carry:carry.slice(),placed,total,lost,found,done,px,py,coins:coins.length}),
  move:(x,y)=>{px=x;py=y},joy:J}}
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
// ---------- MISSION: PROCESSION (free walk) ----------
function proc(m){const diff=m.diff||0;let px=.5,py=.86,dist=0,goal=60+diff*25,obs=[],hitc=0,inc=0,spawn=0,over=0,inv=0,J=makeJoy(),spd=.7;
 const kinds=[['Dropped kneeler','#6b3a1c'],['Puddle','#4a7ab0'],['Stray dog','#a0703a'],['Fallen candle','#eee']];
 const solids=[{x:.0,y:.0,w:.12,h:1},{x:.88,y:.0,w:.12,h:1}];
 scene={bg:'crossroads',tick:dt=>{if(over)return;dist+=dt*5.5;spawn-=dt;inv=Math.max(0,inv-dt);
  if(spawn<=0){spawn=.85-Math.min(.4,dist/200)-diff*.05;const r=Math.random();obs.push({x:.25+((Math.random()*3|0)*.25),y:-.08,k:r<.22?-1:Math.random()*4|0,d:0})}
  const{vx,vy}=J.vel();let fx=vx,fy=vy*.35-.15; // gentle forward drift; stick steers
  if(!J.joy.on&&!((J.keys.l||J.keys.r||J.keys.u||J.keys.d)))fy=-.2;
  const mv=tryMove(px,py,fx,fy,spd,dt,solids);px=Math.max(.18,Math.min(.82,mv.px));py=Math.max(.55,Math.min(.92,mv.py));
  obs.forEach(o=>{o.y+=dt*(.35+diff*.03);if(!o.d&&Math.abs(o.y-py)<.05&&Math.abs(o.x-px)<.07){o.d=1;if(o.k<0){inc++;sfx('ok');burst(px*W,py*H,'200,200,255')}else if(inv<=0){hitc++;inv=.7;sfx('bad');toast(kinds[o.k][0]+'! Keep the cross steady')}}});
  obs=obs.filter(o=>o.y<1.1);
  if(dist>=goal){over=1;J.unbind();result('Corpus Christi Procession',50+inc*5-hitc*5+diff*10,20+inc*2,hitc<5,m.id)}
  if(hitc>=5){over=1;J.unbind();result('Procession',20,0,false)}
  const ps=$('#pst');if(ps)ps.textContent=`Route ${Math.min(100,dist/goal*100|0)}% · Incense ${inc} · Stumbles ${hitc}/5`},
  draw:()=>{cx.fillStyle='rgba(60,40,20,.35)';cx.fillRect(W*.12,0,W*.76,H);for(let i=0;i<3;i++){cx.strokeStyle='rgba(255,230,150,.2)';cx.beginPath();cx.moveTo(W*(.25+i*.25),0);cx.lineTo(W*(.25+i*.25),H);cx.stroke()}
   obs.forEach(o=>{if(o.d&&o.k>=0)return;const ox=o.x*W,oy=o.y*H;if(o.k<0){cx.fillStyle='rgba(220,220,255,.8)';cx.beginPath();cx.arc(ox,oy,14+Math.sin(T*6)*3,0,6.28);cx.fill()}else{cx.fillStyle=kinds[o.k][1];cx.beginPath();cx.ellipse(ox,oy,30,18,0,0,6.28);cx.fill();cx.fillStyle='#fff';cx.font='11px Georgia';cx.textAlign='center';cx.fillText(kinds[o.k][0],ox,oy-22)}});
   spr(IMG.i_cross,px*W,py*H-H*.14,H*.12);spr(IMG.server,px*W,py*H,H*.14,0,J.facing<0);spr(IMG.priest,px*W+W*.08,py*H+H*.06,H*.12,1)}};
 hud();h(`<div id="play" class="play"><div class="objstrip" id="pst"></div><div class="log" style="top:calc(var(--hh) + 36px)">Drag to steer · WASD/arrows · avoid obstacles, gather incense.</div><div id="joybase" class="hide"><div id="joyknob"></div></div></div>`);
 J.bind($('#play'));
 window.G.cur={type:'proc',state:()=>({px,py,obs:obs.map(o=>({x:o.x,y:o.y,k:o.k,d:o.d})),hitc,inc,dist,goal}),auto:()=>{dist=goal}}}

window.G={get S(){return S},set S(v){S=v},hub,start:id=>start(MISSIONS.find(m=>m.id==id)),cur:null,save,loadS};
let imgsLeft=Object.keys(IMG).length;Object.values(IMG).forEach(i=>{const f=()=>{if(--imgsLeft==0)0};i.onload=f;i.onerror=()=>console.warn('img fail',i.src)});
hub();
