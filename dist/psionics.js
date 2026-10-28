/* Mongoose Traveller 2008, pp. 34, 152, 158–159. Character generation only. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TravellerPsionics=api})(globalThis,function(){
const source='pp. 152, 158–159';
const talents=[
 {id:'Telepathy',dm:4,description:'Mind-to-mind communication and perception.'},
 {id:'Clairvoyance',dm:3,description:'Perception beyond your immediate surroundings.'},
 {id:'Telekinesis',dm:2,description:'Moving and manipulating matter with the mind.'},
 {id:'Awareness',dm:1,description:'Control over your own mind and body.'},
 {id:'Teleportation',dm:0,description:'Instant movement from one location to another.'}
];
const isTalent=name=>talents.some(t=>t.id===name);
function normalize(s){const p=s.psionics||(s.psionics={access:s.psi!==undefined?'legacy':null,tested:s.psi!==undefined,trainingComplete:false,initialComplete:false,attempts:[],initialTried:[],testingWeeks:0,trainingMonths:0});return p}
const inc=name=>({type:'increase',name}),grant=name=>({type:'grant',name,level:1}),stat=index=>({type:'stat',index,delta:1}),choice=(...options)=>({type:'choice',options}),psi=delta=>({type:'psi',delta}),any={type:'anySkill'},anyPsi={type:'psionicChoice'},assignment=(name,sa,st,aa,at)=>({name,survival:{attribute:sa,target:st},advancement:{attribute:aa,target:at}});
const ranks=awards=>({standard:Array.from({length:7},(_,rank)=>({rank,title:awards[rank]?.title||'',award:awards[rank]?.award}))});
const career={id:'psion',name:'Psion',source,military:false,specialistBasic:true,requiresPsionics:true,entry:{name:'Qualification',attribute:'psi',target:6},assignments:{wild:assignment('Wild Talent',5,6,3,8),adept:assignment('Adept',4,4,4,8),warrior:assignment('Psi-Warrior',2,6,2,6)},tables:{
 personal:[stat(4),stat(3),stat(0),stat(1),stat(2),psi(1)],
 service:[...talents.map(t=>inc(t.id)),any],
 education:['Связь','Компьютеры','Язык','Медик','Наука о жизни','Космическая наука'].map(inc),
 wild:[inc('Telepathy'),inc('Telekinesis'),inc('Обман'),inc('Скрытность'),inc('Знание улиц'),choice(inc('Ближний'),inc('Огн. Бой'))],
 adept:['Telepathy','Clairvoyance','Awareness','Медик','Убеждение','Социальная наука'].map(inc),
 warrior:['Telepathy','Awareness','Teleportation','Огн. Бой','Боевое одеяние','Разведка'].map(inc)
 },ranksByAssignment:{
 wild:ranks({1:{title:'Survivor',award:choice(grant('Выживание'),grant('Знание улиц'))},3:{title:'Witch',award:grant('Обман')}}),
 adept:ranks({1:{title:'Initiate',award:grant('Наука о жизни (псионикология)')},3:{title:'Acolyte',award:anyPsi},6:{title:'Master',award:anyPsi}}),
 warrior:ranks({0:{title:'Marine'},1:{award:grant('Огн. Бой')},2:{title:'Captain',award:grant('Лидерство')},5:{title:'Force Commander',award:grant('Тактика') }})
 },benefits:{cash:[1000,2000,4000,4000,8000,8000,16000],other:[{type:'weapon',kind:'gun'},{type:'shares',amount:2},{type:'relation',kind:'Контакт'},{type:'asset',name:'TAS Membership'},{type:'relation',kind:'Контакт'},{type:'asset',name:'Combat Implant'},{type:'shares',amount:10}]}};
// A Psi-Warrior's final award is Tactics (any), resolved by the standard speciality chooser.
const e=(type,data={})=>({type,...data}),rel=kind=>e('relation',{kind}),mod=(scope,value,label)=>e('modifier',{scope,value,label}),go=next=>({next}),option=(id,label,effects=[],next='advancement')=>({id,label,effects,next}),sk=name=>e('reward',{name,level:1});
const events={
 2:{title:'Disaster',text:'A disaster interrupts your psionic career. Resolve a Mishap, but remain in this career.',effects:[e('mishap',{stay:true})]},
 3:{title:'Uncomfortable company',text:'Your abilities make someone close to you uneasy. A Contact or Ally becomes a Rival; otherwise gain a Rival.',choiceSource:'psionicRelationship',kind:'Конкурент'},
 4:{title:'Mind and body',text:'Your practice develops a skill outside your psionic talents.',choices:['Атлетика','Скрытность','Выживание','Искусство'].map(name=>option(name,name+' 1',[sk(name)]))},
 5:{title:'An unethical opportunity',text:'You could exploit your powers to improve your standing. Decline, or attempt Psi 8+. Success grants a Benefit roll or Social Standing; failure costs one Social Standing.',choices:[option('decline','Refuse to abuse your powers'),{id:'accept',label:'Use your powers for personal gain',skill:'__psi__',attribute:'psi',target:8,success:{choices:[option('benefit','Gain one extra Benefit roll',[mod('benefit-count',1,'Psionic influence')]),option('standing','Social Standing +1',[e('characteristic',{index:5,delta:1})])]},failure:{effects:[e('characteristic',{index:5,delta:-1})],next:'advancement'}}]},
 6:{title:'An unexpected connection',text:'Your psionic life brings you into contact with someone outside your usual circles.',effects:[rel('Контакт')],next:'advancement'},
 7:{title:'Life Event',text:'Something in your personal life changes. Roll on the Life Events table.',next:'life'},
 8:{title:'Growing strength',text:'You reach a new level of psionic strength. Increase Psi by one.',effects:[e('psi',{delta:1})],next:'advancement'},
 9:{title:'Specialist training',text:'Advanced instruction offers one level in any skill on a successful Education 8+ check.',choices:[{id:'education',label:'Attempt Education 8+',skill:'__education__',attribute:4,target:8,success:{effects:[e('anySkill',{level:1})],next:'advancement'},failure:go('advancement')}]},
 10:{title:'Useful information',text:'Your psychic perceptions reveal information that may help when you leave this career. Gain DM+1 to one Benefit roll.',effects:[mod('any-benefit',1,'Psychic information')],next:'advancement'},
 11:{title:'A mentor',text:'A mentor guides your development. Gain an Ally and DM+4 to your next Advancement check.',effects:[rel('Союзник'),mod('advancement',4,'Psionic mentor')],next:'advancement'},
 12:{title:'New discipline',text:'Your command of your powers earns an automatic promotion, in addition to the normal Advancement check.',effects:[e('promote')],next:'advancement'}
};
const mishaps={
 1:{title:'Injury',text:'You are injured. Resolve the Injury table.',effects:[e('injury')]},
 2:{title:'A dangerous mind',text:'A telepathic encounter with something dangerous leaves persistent nightmares and permanently costs one Psi.',effects:[e('psi',{delta:-1})],next:'$after'},
 3:{title:'Anti-psi persecution',text:'An anti-psi gang or cult attacks or exposes you. Roll 1d6: 1–2 Injury; 3–4 Social Standing −1; 5–6 no further effect. You must still leave this career.',effects:[e('subtable',{table:'persecution'})]},
 4:{title:'An unethical demand',text:'You are ordered to misuse your powers. Accept to remain in this career and gain an Enemy, or refuse and leave.',choices:[option('accept','Accept the demand',[rel('Враг'),e('stayCareer')],'$after'),option('refuse','Refuse and leave',[e('exit',{reason:'Refused an unethical use of psionics.'})],'$after')]},
 5:{title:'An experimental subject',text:'An organisation experiments on you. You escape and leave this career, gaining a Contact inside and the organisation as an Enemy.',effects:[rel('Контакт'),rel('Враг')],next:'$after'},
 6:{title:'Betrayed for your gift',text:'Someone close to you turns against you. Convert an Ally or Contact to an Enemy, or gain an Enemy if you have neither.',choiceSource:'psionicRelationship',kind:'Враг'}
};
function install(R){R.tables.psion={events:{dice:{count:2,sides:6},rows:events},mishaps:{dice:{count:1,sides:6},rows:mishaps},persecution:{dice:{count:1,sides:6},rows:{1:{effects:[e('injury')]},2:{effects:[e('injury')]},3:{effects:[e('characteristic',{index:5,delta:-1})],next:'$after'},4:{effects:[e('characteristic',{index:5,delta:-1})],next:'$after'},5:go('$after'),6:go('$after')}}};const old=R.choices;R.choices=function(row,s){if(row.choiceSource==='psionicRelationship'){const friends=s.relations.filter(r=>['Контакт','Союзник'].includes(r.type)),after=s.phase==='mishap'||s.phase==='mishapchoice'?'$after':'advancement';return friends.length?friends.map(r=>option(r.id,r.name+' → '+row.kind,[e('betray',{id:r.id,kind:row.kind})],after)):[option('new','Gain a '+(row.kind==='Враг'?'Enemy':'Rival'),[rel(row.kind)],after)]}return old(row,s)};Object.values(R.tables.psion).forEach(R.validate)}
return {source,talents,isTalent,normalize,career,install};
});
