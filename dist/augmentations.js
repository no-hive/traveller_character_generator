/* Combat Implant Benefit choices, Core Rules pp. 35, 89–90. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TravellerAugmentations=api})(globalThis,function(){
const definitions=[
 {id:'subdermal',name:'Subdermal Armour',levels:[{tl:10,armour:1},{tl:11,armour:3}]},
 {id:'neural',name:'Neural Jack',levels:[{tl:12,computer:2},{tl:13,computer:4}]},
 ...['Strength','Dexterity','Endurance'].map((name,index)=>({id:'physical-'+index,name:name+' Augmentation',index,levels:[{tl:11,bonus:1},{tl:12,bonus:2},{tl:15,bonus:3}]})),
 {id:'intelligence',name:'Intelligence Augmentation',index:3,levels:[{tl:12,bonus:1},{tl:14,bonus:2},{tl:16,bonus:3}]}
];
function label(item){return item.name+' · TL '+item.tl+(item.bonus?' · +'+item.bonus:'')+(item.armour?' · Armour '+item.armour:'')+(item.computer?' · Computer/'+item.computer:'')}
function choices(s){const owned=s.augmentations||[],out=definitions.flatMap(d=>{const existing=owned.find(x=>x.id===d.id),i=existing?d.levels.findIndex(l=>l.tl===existing.tl)+1:0;if(!d.levels[i])return [];const item={id:d.id,name:d.name,...(d.index!==undefined?{index:d.index}:{}),...d.levels[i]};return [{id:d.id,label:(existing?'Upgrade ':'Receive ')+label(item),benefit:{type:'augmentation',item}}]});if(!owned.some(a=>a.id==='skill'))for(const skill of Object.keys(s.skills).filter(k=>!k.includes(' (')||s.skills[k]>0)){const item={id:'skill',name:'Skill Augmentation ('+skill+')',skill,tl:12};out.push({id:'skill:'+skill,label:'Skill Augmentation · '+skill+' · TL 12 · DM+1',benefit:{type:'augmentation',item}})}return out}
return {definitions,label,choices};
});
