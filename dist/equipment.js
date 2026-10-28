/* Core Rules 2008, pp. 34, 96–97. Explicit prices; no random purchases. */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./equipment-extra.js'):root.TravellerEquipmentExtra);if(typeof module==='object'&&module.exports)module.exports=api;else root.TravellerEquipment=api})(globalThis,function(X){
const LIMIT=2000;
const baseItems=[
['binoculars','Binoculars',3,75,1,'Sensors',96],
['binoculars-electronic','Binoculars (electronic)',8,750,1,'Sensors',96],
['geiger','Geiger Counter',5,250,0,'Sensors',96],
['ir-goggles','IR Goggles',6,500,0,'Sensors',96],
['light-intensifier','Light Intensification Goggles',7,500,0,'Sensors',96],
['motion-sensor','Motion Sensor',7,500,0,'Sensors',96],
['motion-sensor-advanced','Motion Sensor (advanced)',9,1000,0,'Sensors',96],
['em-probe','Electromagnetic Probe',10,1000,0,'Sensors',96],
['tent','Tent',3,200,0,'Survival',96],
['tent-sealed','Tent (sealed)',7,2000,0,'Survival',96],
['rebreather','Rebreather',6,250,10,'Survival',96],
['respirator','Respirator',6,100,0,'Survival',97],
['filter','Filter Mask',7,100,0,'Survival',97],
['combination-mask','Combination Mask',8,150,0,'Survival',97],
['environment-suit','Environment Suit',8,500,0,'Survival',97],
['rescue-bubble','Rescue Bubble',9,600,0,'Survival',97],
['thruster-pack','Thruster Pack',9,2000,0,'Survival',97],
['tools-mechanic','Toolkit (Mechanic)',0,1000,12,'Tools',97],
['tools-survey','Toolkit (Surveying)',0,1000,12,'Tools',97],
['tools-science','Toolkit (Scientific)',0,1000,12,'Tools',97],
['tools-forensic','Toolkit (Forensic)',0,1000,12,'Tools',97],
...['electronics','jump drive','life support','manoeuvre drive','power plant'].map(x=>['tools-'+x.replace(/ /g,'-'),'Toolkit (Engineer: '+x+')',0,1000,12,'Tools',97])
].map(([id,name,tl,cost,mass,category,page])=>({id,name,tl,cost,mass,category,page}));
const catalogue=[...baseItems.map(i=>({...i,scientific:['Sensors','Tools'].includes(i.category),family:i.id==='motion-sensor-advanced'?'motion-sensor':i.id==='binoculars-electronic'?'binoculars':i.id})),...X.items];
const items=catalogue.filter(i=>i.cost<=LIMIT);
const scientific=catalogue.filter(i=>i.scientific&&!catalogue.some(j=>j.scientific&&j.family===i.family&&j.tl<i.tl));
function normalize(s){s.equipment=s.equipment||{cart:[],purchases:[],spent:0};return s.equipment}
function total(cart){return cart.reduce((n,line)=>{const item=items.find(x=>x.id===line.id);if(!item||!Number.isInteger(line.quantity)||line.quantity<1||line.quantity>100)throw Error('Invalid equipment selection.');return n+item.cost*line.quantity},0)}
function change(s,id,delta){const e=normalize(s);if(!items.some(x=>x.id===id)||![1,-1].includes(delta))throw Error('Invalid equipment action.');const cart=e.cart.map(x=>({...x})),line=cart.find(x=>x.id===id);if(line)line.quantity+=delta;else if(delta>0)cart.push({id,quantity:1});else throw Error('Item is not selected.');e.cart=cart.filter(x=>x.quantity>0);total(e.cart)}
function purchase(s){const e=normalize(s),cost=total(e.cart);if(e.spent+cost>LIMIT)throw Error('Starting equipment may cost at most Cr2,000.');if(cost>s.finalFunds.cash)throw Error('Insufficient credits after outstanding costs.');const bought=e.purchases.slice();for(const line of e.cart){const existing=bought.find(x=>x.id===line.id);if(existing)existing.quantity+=line.quantity;else bought.push({...items.find(x=>x.id===line.id),quantity:line.quantity,source:'purchase'})}e.purchases=bought;e.spent+=cost;s.finalFunds.cash-=cost;e.cart=[];return cost}
return {LIMIT,items,catalogue,scientific,normalize,total,change,purchase};
});
