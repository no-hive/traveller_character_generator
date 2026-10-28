/* Traveller career catalogue. Pure data; no DOM, storage or network access. */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./careers-extra.js'):root.TravellerExtraCareers,typeof module==='object'&&module.exports?require('./careers-civilian.js'):root.TravellerCivilianCareers,typeof module==='object'&&module.exports?require('./psionics.js'):root.TravellerPsionics,typeof module==='object'&&module.exports?require('./remaining-careers.js'):root.TravellerRemainingCareers);if(typeof module==='object'&&module.exports)module.exports=api;else root.TravellerCareers=api})(typeof globalThis==='object'?globalThis:this,function(extra,civilian,P,F){
'use strict';
const stat=(index,delta=1)=>({type:'stat',index,delta});
const increase=(name,choices)=>({type:'increase',name,choices});
const grant=(name,level=1,choices)=>({type:'grant',name,level,choices});
const scout={
  id:'scout',name:'Scout',military:false,source:'pp. 32–33',
  entry:{name:'Qualification',attribute:3,target:5,agePenalty:null},
  assignments:{
    courier:{name:'Courier',survival:{attribute:2,target:5},advancement:{attribute:4,target:9}},
    survey:{name:'Survey',survival:{attribute:2,target:6},advancement:{attribute:3,target:8}},
    explore:{name:'Exploration',survival:{attribute:2,target:7},advancement:{attribute:4,target:7}}
  },
  tables:{
    personal:[stat(0),stat(1),stat(2),stat(3),stat(4),increase('Мастер на все руки')],
    service:[increase('Пилот',['малые','средние']),increase('Выживание'),increase('Механика'),increase('Астрогация'),increase('Связь'),increase('Огн. Бой')],
    education:[increase('Медик'),increase('Навигация'),increase('Инженерия'),increase('Компьютеры'),increase('Космическая наука'),increase('Мастер на все руки')],
    courier:[increase('Связь'),increase('Сенсоры'),increase('Пилот (средние)'),increase('Скафандры'),increase('Невесомость'),increase('Астрогация')],
    survey:[increase('Сенсоры'),increase('Убеждение'),increase('Пилот (малые)'),increase('Навигация'),increase('Дипломатия'),increase('Знание улиц')],
    explore:[increase('Сенсоры'),increase('Пилот (средние)'),increase('Пилот (малые)'),increase('Наука о жизни'),increase('Скрытность'),increase('Разведка')]
  },
  ranks:{standard:[{rank:1,award:grant('Скафандры',1)},{rank:3,award:grant('Пилот',1)}]},
  benefits:{cash:[20000,20000,30000,30000,50000,50000,50000],other:[{type:'shares',amount:1},stat(3),stat(4),{type:'weapon'},{type:'weapon'},{type:'scout-ship'},{type:'scout-ship'}]}
};
const navy={
  id:'navy',name:'Navy',military:true,source:'pp. 24–25',
  entry:{name:'Enlistment',attribute:3,target:6,agePenalty:{minimum:34,value:-2}},
  commission:{attribute:5,target:8},
  assignments:{
    line:{name:'Line/Crew',survival:{attribute:3,target:5},advancement:{attribute:4,target:7}},
    engineering:{name:'Engineering/Gunnery',survival:{attribute:3,target:6},advancement:{attribute:4,target:6}},
    flight:{name:'Flight',survival:{attribute:1,target:7},advancement:{attribute:4,target:5}}
  },
  tables:{
    personal:[stat(0),stat(1),stat(2),stat(3),stat(4),stat(5)],
    service:[increase('Пилот'),increase('Скафандры'),increase('Невесомость'),increase('Стрелок'),increase('Механика'),increase('Огн. Бой')],
    education:[increase('Удаленный контроль'),increase('Астрогация'),increase('Инженерия'),increase('Компьютеры'),increase('Навигация'),increase('Админ')],
    officer:[increase('Лидерство'),increase('Тактика (флот)'),increase('Пилот'),increase('Ближний (большой клинок)'),increase('Админ'),increase('Тактика (флот)')],
    line:[increase('Связь'),increase('Механика'),increase('Огн. Бой'),increase('Сенсоры'),increase('Ближний'),increase('Скафандры')],
    engineering:[increase('Инженерия'),increase('Механика'),increase('Сенсоры'),increase('Инженерия'),increase('Стрелок'),increase('Компьютеры')],
    flight:[increase('Пилот'),increase('Летчик'),increase('Стрелок'),increase('Пилот (малые)'),increase('Астрогация'),increase('Невесомость')]
  },
  ranks:{
    enlisted:[
      {rank:0,title:'Crewman'},
      {rank:1,title:'Able Spacehand',award:grant('Механика',1)},
      {rank:2,title:'Petty Officer, 3rd Class',award:grant('Скафандры',1)},
      {rank:3,title:'Petty Officer, 2nd Class'},
      {rank:4,title:'Petty Officer, 1st Class',award:stat(2)},
      {rank:5,title:'Chief Petty Officer'},
      {rank:6,title:'Warrant Officer'}
    ],
    officer:[
      {rank:0,title:''},
      {rank:1,title:'Ensign',award:grant('Ближний (большой клинок)',1)},
      {rank:2,title:'Sublieutenant',award:grant('Лидерство',1)},
      {rank:3,title:'Lieutenant'},
      {rank:4,title:'Commander',award:grant('Тактика (флот)',1)},
      {rank:5,title:'Captain',award:{type:'minimum-or-increase',index:5,minimum:10,delta:1}},
      {rank:6,title:'Admiral',award:{type:'minimum-or-increase',index:5,minimum:12,delta:1}}
    ]
  },
  benefits:{
    cash:[1000,5000,5000,10000,20000,50000,50000],
    other:[
      {type:'choice',options:[{type:'asset',name:'Air/Raft'},{type:'shares',amount:1}]},
      stat(3),
      {type:'choice',options:[stat(4),{type:'shares',amount:2}]},
      {type:'weapon'},
      {type:'asset',name:'TAS Membership'},
      {type:'choice',options:[{type:'asset',name:"Ship's Boat"},{type:'shares',amount:2}]},
      stat(5,2)
    ]
  }
};
const careers={scout,navy,...extra,...civilian,...F.careers,psion:P.career};
function get(id){return careers[id]||null}
return {careers,get,installRemainingRules:F.install};
});
