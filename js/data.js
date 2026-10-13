const ITEMS={chalice:['Chalice','credence'],paten:['Paten','credence'],ciborium:['Ciborium','credence'],cruets:['Cruets','credence'],lavabo:['Lavabo bowl & towel','credence'],corporal:['Corporal','credence'],purificator:['Purificator','credence'],missal:['Roman Missal','altar'],candle:['Altar Candle','altar'],lectionary:['Lectionary','ambo'],cross:['Processional Cross','stand'],thurible:['Thurible','stand'],boat:['Incense Boat','stand'],bell:['Sanctus Bells','credence'],water:['Holy Water Aspergillum','stand'],mitre:['Mitre','altar'],crozier:['Crozier','stand'],chrism:['Chrism Oil','ambo']};
const ZONES={altar:['Altar',36,40,28,16],credence:['Credence',6,52,24,14],ambo:['Ambo',70,52,24,14],stand:['Procession Stand',60,66,34,10]};
const SEASONS=[
 {n:'Ordinary Time',c:'#4a4',items:['chalice','paten','cruets','missal','lectionary','candle','cross','purificator']},
 {n:'Advent',c:'#74a',items:['chalice','paten','cruets','missal','lectionary','candle','cross','corporal','lavabo']},
 {n:'Lent',c:'#639',items:['chalice','ciborium','cruets','missal','lectionary','lavabo','purificator','corporal'],note:'Lent: violet, no flowers, a solemn sanctuary.'},
 {n:'Easter Vigil',c:'#fd6',items:['chalice','paten','ciborium','cruets','missal','lectionary','candle','cross','thurible','boat','water','bell']},
 {n:'Christmas',c:'#fff',items:['chalice','paten','ciborium','cruets','missal','lectionary','candle','cross','thurible','boat','bell']},
 {n:'Feast of St Michael',c:'#e33',items:['chalice','paten','cruets','missal','lectionary','candle','cross','thurible','boat','bell','corporal']},
 {id:'confirm',n:'Confirmation Mass',c:'#8cf',items:['chalice','paten','cruets','missal','lectionary','candle','cross','chrism','mitre','crozier','bell','corporal'],note:'Confirmation: chrism, mitre and crozier for the Bishop.'},
 {id:'papal',n:"St. Peter's Vigil",c:'#ffd',items:['chalice','paten','ciborium','cruets','missal','lectionary','candle','cross','thurible','boat','water','bell','mitre','crozier','chrism'],note:'A solemn Roman vigil — every vessel in its place.'}];
const RANKS=[
 ['Altar Server',0,'server'],
 ['Seminarian',250,'seminarian'],
 ['Deacon',700,'seminarian'],
 ['Priest',1500,'priest'],
 ['Monsignor',2800,'priest'],
 ['Bishop',4500,'priest'],
 ['Archbishop',7000,'priest'],
 ['Cardinal',10500,'priest']];
const SKILLS={
 ourfather:{n:'Our Father',cost:0,pow:10,cd:0,d:'The prayer Our Lord taught us.'},
 hailmary:{n:'Hail Mary',cost:0,pow:6,heal:8,cd:0,d:'Steadies your faith; Our Lady intercedes.'},
 water:{n:'Holy Water',cost:0,pow:18,cd:2,uses:2,d:'Sacramental blessed by the priest. Limited uses.'},
 crucifix:{n:'Raise Crucifix',cost:1,pow:22,cd:3,d:'"Behold the Cross of the Lord" — stuns the demon.',stun:1},
 michael:{n:'St Michael Prayer',cost:1,pow:34,cd:4,d:'"St Michael the Archangel, defend us in battle..."'},
 litany:{n:'Litany of the Saints',cost:2,pow:14,heal:14,cd:3,d:'Call on the whole Church in heaven.'},
 rosary:{n:'Rosary Decade',cost:2,pow:12,cd:2,buff:1,d:'Next prayers are 50% stronger.'}};
const SHOP={
 rosary:['Wooden Rosary','rosary',40,{dev:2},'+2 Devotion'],
 scapular:['Brown Scapular','scapular',60,{faith:20},'+20 max Faith'],
 medal:['St Benedict Medal','medal',90,{guard:3},'-3 demon damage'],
 vestment:['New Cassock & Surplice','vestment',70,{wis:2},'+2 Wisdom (more time, more XP)'],
 water:['Holy Water Flask','water',50,{water:2},'+2 Holy Water uses'],
 sword:['St Michael Medal','sword',150,{dev:4,guard:2},'+4 Devotion, -2 damage']};
const DEMONS={
 house:['Spirit of Discord',60,7,'house'],
 cross:['Spirit of Despair',95,10,'crossroads'],
 hosp:['Legion\'s Whisper',140,13,'hospital'],
 chapel:['Spirit of Pride',190,16,'house'],
 crypt:['Ancient Tempter',260,20,'hospital']};
const MISSIONS=[
 {id:'prep1',t:'Sunday Mass Prep',type:'prep',x:50,y:30,req:null,diff:0},
 {id:'bells',t:'Bells at the Consecration',type:'bells',x:50,y:40,req:'prep1',diff:0},
 {id:'house',t:'Blessing a Troubled House',type:'exo',demon:'house',x:22,y:50,req:'bells',diff:0},
 {id:'proc',t:'Corpus Christi Procession',type:'proc',x:78,y:50,req:'house',diff:0},
 {id:'feast',t:'Feast-day Mass Prep',type:'prep',x:50,y:58,req:'proc',diff:1},
 {id:'cross',t:'The Crossroads',type:'exo',demon:'cross',x:22,y:66,req:'feast',rank:1,diff:1},
 {id:'hosp',t:'The Old Hospital',type:'exo',demon:'hosp',x:78,y:66,req:'cross',rank:2,diff:2},
 {id:'prep2',t:'Cathedral Mass Prep',type:'prep',x:50,y:74,req:'hosp',rank:3,diff:2},
 {id:'bells2',t:'Pontifical Bells',type:'bells',x:28,y:80,req:'prep2',rank:3,diff:2},
 {id:'confirm',t:'Confirmation Mass Prep',type:'prep',sea:'confirm',x:72,y:80,req:'bells2',rank:5,diff:3},
 {id:'chapel',t:'Chapel of Shadows',type:'exo',demon:'chapel',x:22,y:88,req:'confirm',rank:5,diff:3},
 {id:'proc2',t:'Papal-style Procession',type:'proc',x:78,y:88,req:'chapel',rank:7,diff:4},
 {id:'crypt',t:'The Crypt Vigil',type:'exo',demon:'crypt',x:35,y:94,req:'proc2',rank:7,diff:4},
 {id:'final',t:"St. Peter's Vigil",type:'prep',sea:'papal',x:65,y:94,req:'crypt',rank:7,diff:4}];
const STORY={
 intro:['Welcome, my child. I am Fr. Thomas, pastor of St. Joseph\'s.','Serving at the altar is a great privilege — we prepare the place where heaven touches earth.','Begin by preparing the sanctuary for Sunday Mass. Grace earned can be offered in the sacristy shop for things that help you grow.'],
 howto:['How to play: tap mission nodes on the map. In Mass Prep, tap an item then its zone — walk the server with drag, tap, or WASD.','Ring bells on cue, pray in blessings, and keep processions steady. Progress autosaves; use Saves for slots or a save code.'],
 bells:['Well done! Now, the bells. At the Consecration, ring them so all may know Christ is truly present.'],
 house:['A family has asked for their home to be blessed. Strange things trouble them.','Remember: it is not our strength. Demons flee by the power of God. I lead; you assist with prayer and holy water. Stay close.'],
 proc:['Corpus Christi! We carry Our Lord through the streets. Guide the procession — keep the cross steady and the path clear.'],
 feast:['A great feast is coming. The sacristy is busy — and someone has misplaced something again!'],
 cross:['You have grown, Seminarian. At the old crossroads, a man fell into despair through occult games. We go to pray with him.'],
 hosp:['As a Deacon you will assist me at the old hospital. This is harder work. Fast, pray, and trust in Christ.'],
 prep2:['Ordained a priest! The cathedral awaits your careful hands. More vessels, less time — serve with love.'],
 bells2:['Pontifical Mass: the bells must be precise. Listen closely.'],
 confirm:['Confirmation day. The Bishop needs mitre, crozier, and chrism prepared with the rest.'],
 chapel:['Pride has nested in an old chapel. We go with humility and the Cross.'],
 proc2:['A papal-style procession through the city. Longer road, sharper hazards — hold the cross high.'],
 crypt:['Beneath the basilica, an ancient temptation stirs. As Cardinal-elect you stand firm with me.'],
 final:['St. Peter\'s Vigil. Every sacred thing in place. This is the crown of a lifetime of service.'],
 priest:['Thanks be to God — you have been ordained a priest! Your ministry deepens; greater missions await.'],
 end:['You have been created a Cardinal. Faithful from the first server\'s cassock to the red hat — "Not to us, O Lord, but to Your name give glory."']};
