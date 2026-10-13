const ITEMS={chalice:['Chalice','credence'],paten:['Paten','credence'],ciborium:['Ciborium','credence'],cruets:['Cruets','credence'],lavabo:['Lavabo bowl & towel','credence'],corporal:['Corporal','credence'],purificator:['Purificator','credence'],missal:['Roman Missal','altar'],candle:['Altar Candle','altar'],lectionary:['Lectionary','ambo'],cross:['Processional Cross','stand'],thurible:['Thurible','stand'],boat:['Incense Boat','stand'],bell:['Sanctus Bells','credence'],water:['Holy Water Aspergillum','stand']};
const ZONES={altar:['Altar',36,40,28,16],credence:['Credence',6,52,24,14],ambo:['Ambo',70,52,24,14],stand:['Procession Stand',60,66,34,10]};
const SEASONS=[
 {n:'Ordinary Time',c:'#4a4',items:['chalice','paten','cruets','missal','lectionary','candle','cross','purificator']},
 {n:'Advent',c:'#74a',items:['chalice','paten','cruets','missal','lectionary','candle','cross','corporal','lavabo']},
 {n:'Lent',c:'#639',items:['chalice','ciborium','cruets','missal','lectionary','lavabo','purificator','corporal'],note:'Lent: violet, no flowers, a solemn sanctuary.'},
 {n:'Easter Vigil',c:'#fd6',items:['chalice','paten','ciborium','cruets','missal','lectionary','candle','cross','thurible','boat','water','bell']},
 {n:'Christmas',c:'#fff',items:['chalice','paten','ciborium','cruets','missal','lectionary','candle','cross','thurible','boat','bell']},
 {n:'Feast of St Michael',c:'#e33',items:['chalice','paten','cruets','missal','lectionary','candle','cross','thurible','boat','bell','corporal']}];
const RANKS=[['Altar Server',0,'server'],['Seminarian',150,'seminarian'],['Deacon',400,'seminarian'],['Priest',800,'priest']];
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
const DEMONS={house:['Spirit of Discord',60,7,'house'],cross:['Spirit of Despair',95,10,'crossroads'],hosp:['Legion\'s Whisper',140,13,'hospital']};
const MISSIONS=[
 {id:'prep1',t:'Sunday Mass Prep',type:'prep',x:50,y:40,req:null},
 {id:'bells',t:'Bells at the Consecration',type:'bells',x:50,y:51,req:'prep1'},
 {id:'house',t:'Blessing a Troubled House',type:'exo',demon:'house',x:22,y:62,req:'bells'},
 {id:'proc',t:'Corpus Christi Procession',type:'proc',x:78,y:62,req:'house'},
 {id:'feast',t:'Feast-day Mass Prep',type:'prep',x:50,y:73,req:'proc'},
 {id:'cross',t:'The Crossroads',type:'exo',demon:'cross',x:22,y:84,req:'feast',rank:1},
 {id:'hosp',t:'The Old Hospital',type:'exo',demon:'hosp',x:78,y:84,req:'cross',rank:2}];
const STORY={
 intro:['Welcome, my child. I am Fr. Thomas, pastor of St. Joseph\'s.','Serving at the altar is a great privilege — we prepare the place where heaven touches earth.','Begin by preparing the sanctuary for Sunday Mass. Grace earned can be offered in the sacristy shop for things that help you grow.'],
 bells:['Well done! Now, the bells. At the Consecration, ring them so all may know Christ is truly present.'],
 house:['A family has asked for their home to be blessed. Strange things trouble them.','Remember: it is not our strength. Demons flee by the power of God. I lead; you assist with prayer and holy water. Stay close.'],
 proc:['Corpus Christi! We carry Our Lord through the streets. Guide the procession — keep the cross steady and the path clear.'],
 feast:['A great feast is coming. The sacristy is busy — and someone has misplaced something again!'],
 cross:['You have grown, Seminarian. At the old crossroads, a man fell into despair through occult games. We go to pray with him.'],
 hosp:['As a Deacon you will assist me at the old hospital. This is the hardest work yet. Fast, pray, and trust in Christ.'],
 end:['You have served faithfully. Remember always: "Not to us, O Lord, but to Your name give glory."']};
