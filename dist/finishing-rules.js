/* Core Rules (2008), pp. 6, 8, 35–40. Data shared by engine and UI. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TravellerFinishing=api})(globalThis,function(){
const packs={
 traveller:{name:'Traveller',skills:['Пилот','Сенсоры','Связь','Стрелок','Огн. Бой','Убеждение','Скрытность','Медик']},
 mercenary:{name:'Mercenary',skills:['Сенсоры','Связь','Медик','Лидерство','Тяжелое оружие','Огн. Бой','Огн. Бой','Скрытность']},
 trader:{name:'Trader',skills:['Пилот','Сенсоры','Медик','Знание улиц','Брокер','Адвокат','Дипломатия','Астрогация']},
 starship:{name:'Starship',skills:['Пилот','Стрелок','Инженерия','Механика','Сенсоры','Медик','Связь','Астрогация']},
 explorer:{name:'Explorer',skills:['Пилот','Астрогация','Сенсоры','Выживание','Разведка','Огн. Бой','Скрытность','Медик']},
 diplomat:{name:'Diplomat',skills:['Адвокат','Дипломатия','Убеждение','Скрытность','Знание улиц','Обман','Компьютеры','Связь']},
 investigator:{name:'Investigator',skills:['Адвокат','Админ','Расследование','Убеждение','Скрытность','Знание улиц','Компьютеры','Сенсоры','Огн. Бой']},
 criminal:{name:'Criminal',skills:['Пилот','Сенсоры','Скрытность','Обман','Убеждение','Знание улиц','Брокер','Медик']}
};
const statCosts={2:-3,3:-2,4:-1,5:0,6:1,7:2,8:3,9:5,10:6,11:8,12:10,13:12,14:15,15:18},skillCosts={0:1,1:2,2:4,3:6,4:8};
const budget=terms=>terms===1?24:terms===2?30:terms===3?35:40+(terms-4)*10;
const minimum=terms=>terms===1?10:terms===2?12:terms===3?14:16;
function pointCost(p){const characteristics=p.stats.reduce((n,v)=>n+statCosts[v],0),skills=Object.entries(p.skills).reduce((n,[name,v])=>n+skillCosts[v]*(name==='Мастер на все руки'?5:1),0);return {characteristics,skills,total:characteristics+skills+2*p.rank+2*p.benefits}}
function normalize(s){s.rules=s.rules||{method:'random',solo:false,ironMan:false};s.homeworldSkillsChosen=s.homeworldSkillsChosen||(s.homeworldSkill?[s.homeworldSkill]:[]);s.finishing=s.finishing||{connections:[],connectionsDone:false,pack:null,allocations:[],packsDone:false};return s.finishing}
function valid(s){const r=s.rules,f=s.finishing;if(!r||!['random','choose','pointbuy'].includes(r.method)||typeof r.solo!=='boolean'||typeof r.ironMan!=='boolean'||r.method==='pointbuy'&&r.ironMan)return false;if(!Array.isArray(s.homeworldSkillsChosen)||new Set(s.homeworldSkillsChosen).size!==s.homeworldSkillsChosen.length||!s.homeworldSkillsChosen.every(n=>typeof n==='string'))return false;if(!f||!Array.isArray(f.connections)||f.connections.length>2||new Set(f.connections.map(c=>c.partner?.toLowerCase())).size!==f.connections.length||!f.connections.every(c=>typeof c.partner==='string'&&c.partner.trim().length>0&&typeof c.description==='string'&&typeof c.skill==='string'&&c.skill!=='Мастер на все руки'&&Number.isInteger(c.level)&&c.level>=1&&c.level<=3)||!Array.isArray(f.allocations)||f.pack!==null&&!packs[f.pack])return false;if(f.pack&&(new Set(f.allocations.map(a=>a.index)).size!==f.allocations.length||!f.allocations.every(a=>Number.isInteger(a.index)&&packs[f.pack].skills[a.index]===a.name&&typeof a.recipient==='string'&&typeof a.self==='boolean')))return false;if(s.phase==='pointbuy'){const p=s.pointbuy;if(!p||!Number.isInteger(p.terms)||p.terms<1||p.terms>12||!Array.isArray(p.stats)||p.stats.length!==6||!p.stats.every(v=>Number.isInteger(v)&&statCosts[v]!==undefined)||!p.skills||!Object.values(p.skills).every(n=>Number.isInteger(n)&&skillCosts[n]!==undefined)||!Number.isInteger(p.rank)||p.rank<0||p.rank>6||!Number.isInteger(p.benefits)||p.benefits<0||p.benefits>24)return false}return true}
function pension(record){return !['scout','rogue','drifter'].includes(record.careerId)&&record.termsAttempted>=5?10000+(record.termsAttempted-5)*2000:0}
return {packs,statCosts,skillCosts,budget,minimum,pointCost,normalize,pension,valid};
});
