(function(root){
'use strict';
const M=typeof module==='object'?require('./map.js'):root.BridgeMap;
const emptyJoint=()=>({offset:3,pin:null,locked:false,chain:false});
function create(){return {version:1,operation:'khaybar',mission:'bridge-03',stage:'intro',dialogue:0,unlocked:0,parts:[],joints:M.slots.slice(1).map(emptyJoint),anchors:{},passed:false,attempts:0}}
function issue(stage,index,text){return {stage,index,text}}
const Parts={
 add(s,condition='healthy'){if(!['healthy','ear','coat'].includes(condition))return null;const p={id:s.parts.reduce((m,p)=>Math.max(m,p.id),0)+1,condition,x:70,y:80,angle:0,slot:null};s.parts.push(p);return p},
 invalidate(s,p){if(p.slot!==null){for(const j of [p.slot-1,p.slot])if(s.joints[j])s.joints[j]=emptyJoint();for(const a of M.anchors.filter(a=>a.slot===p.slot))delete s.anchors[a.id]}s.passed=false},
 move(s,p,x,y){this.invalidate(s,p);const t=M.nearest(x,y);p.x=x;p.y=y;p.slot=null;if(Math.hypot(x-t.x,y-t.y)<34&&!s.parts.some(q=>q!==p&&q.slot===t.id)){p.x=t.x;p.y=t.y;p.slot=t.id}return p.slot!==null},
 rotate(s,p,delta){this.invalidate(s,p);p.angle=(p.angle+delta+360)%360},
 remove(s,p){this.invalidate(s,p);s.parts=s.parts.filter(q=>q!==p)},
 errors(s){const errors=[];for(const t of M.slots){const p=s.parts.find(p=>p.slot===t.id);if(!p)errors.push(issue('place',t.id,'این بخش مسیر هنوز سطحه ندارد.'));else if(p.condition!=='healthy')errors.push(issue('place',t.id,p.condition==='ear'?'گوشواره آسیب دیده؛ سطحه را با نمونه سالم تعویض کن.':'پوشش محافظ آسیب دیده؛ سطحه را تعویض کن.'));else if(M.angleError(p.angle,t.angle)>8)errors.push(issue('place',t.id,'جهت سطحه با خط مسیر هم‌راستا نیست؛ آن را بچرخان.'))}if(s.parts.some(p=>p.slot===null))errors.push(issue('place',null,'یک سطحه بیرون مسیر است؛ آن را جابه‌جا کن یا به انبار برگردان.'));return errors}
};
const Connections={
 geometry(s,i){return !Parts.errors(s).some(e=>e.index===i||e.index===i+1)},
 align(s,i,offset){const j=s.joints[i];j.offset=Math.max(-6,Math.min(6,Number(offset)));j.pin=null;j.locked=false;j.chain=false;s.passed=false},
 insert(s,i,pin){const j=s.joints[i];if(!this.geometry(s,i)||Math.abs(j.offset)>.5)return false;if(!['fit','short'].includes(pin))return false;j.pin=pin;j.locked=false;j.chain=false;s.passed=false;return true},
 lock(s,i){const j=s.joints[i];if(j.pin!=='fit')return false;j.locked=true;return true},
 chain(s,i){if(!s.joints[i].pin)return false;s.joints[i].chain=true;return true},
 clear(s,i){s.joints[i]=emptyJoint();s.passed=false},
 status(s,i){const j=s.joints[i];return !j.pin?'اتصال‌نیافته':this.geometry(s,i)&&Math.abs(j.offset)<=.5&&j.pin==='fit'&&j.locked&&j.chain?'صحیح':'ناقص'},
 errors(s){return s.joints.flatMap((j,i)=>this.status(s,i)==='صحیح'?[]:[issue('connect',i,!this.geometry(s,i)?'هندسه سطحه‌های کنار اتصال درست نیست.':!j.pin?'پین اتصال نصب نشده.':j.pin==='short'?'پین کوتاه تمام گوشواره‌ها را درگیر نمی‌کند.':!j.locked?'پین تثبیت نشده؛ زیر بار اتصال باز می‌شود.':!j.chain?'زنجیر نگهدارنده پین نصب نشده.':'گوشواره‌ها هم‌راستا نیستند.')])}
};
const Anchors={
 install(s,id,kind){if(!M.anchors.some(a=>a.id===id)||!['side','light'].includes(kind))return false;s.anchors[id]={kind,tension:25};s.passed=false;return true},
 tune(s,id,tension){if(s.anchors[id]){s.anchors[id].tension=Math.max(0,Math.min(100,Number(tension)));s.passed=false}},
 errors(s){const es=[];for(const a of M.anchors){const v=s.anchors[a.id];if(!v||v.kind!=='side'||v.tension<45||v.tension>75)es.push(issue('anchor',a.slot,!v?'نقطه مهار خالی است.':v.kind==='light'?'مهار سبک در این آزمایش حرکت را کنترل نمی‌کند.':v.tension<45?'مهار شل است؛ کشش را بیشتر کن.':'کشش بیش از حد است؛ مهار را شل‌تر کن.'));}for(const slot of [1,3,5,7]){const l=s.anchors[`${slot}:-1`],r=s.anchors[`${slot}:1`];if(l&&r&&Math.abs(l.tension-r.tension)>15)es.push(issue('anchor',slot,'کشش دو سمت متعادل نیست؛ پل به یک سمت می‌رود.'))}return es}
};
const Simulation={
 ready:s=>!Parts.errors(s).length&&s.joints.every(j=>j.pin)&&M.anchors.every(a=>s.anchors[a.id]),
 evaluate(s){const errors=[...Parts.errors(s),...Connections.errors(s),...Anchors.errors(s)];const drift=M.slots.map(t=>{const a=s.anchors[`${t.id}:-1`],b=s.anchors[`${t.id}:1`];const nearby=errors.filter(e=>e.index===t.id);return {x:(a&&b?(b.tension-a.tension)*.4:0)+nearby.length*5,y:nearby.length*3,amplitude:nearby.length?9:1.2}});return {passed:!errors.length,errors,drift}},
 run(s){s.attempts++;const r=this.evaluate(s);s.passed=r.passed;return r}
};
const Progress={key:'sangarsazan.khaybar.bridge03.v1',
 encode:s=>JSON.stringify(s),
 decode(raw){const s=JSON.parse(raw);if(!s||s.version!==1||s.operation!=='khaybar'||s.mission!=='bridge-03'||!['intro','place','connect','anchor','test','success'].includes(s.stage)||!Number.isInteger(s.dialogue)||s.dialogue<0||s.dialogue>5||!Number.isInteger(s.unlocked)||s.unlocked<0||s.unlocked>3||!Array.isArray(s.parts)||s.parts.length>30||!Array.isArray(s.joints)||s.joints.length!==8||!s.anchors||typeof s.anchors!=='object'||!Number.isInteger(s.attempts)||s.attempts<0)throw Error('ذخیره نامعتبر');const ids=new Set(),slots=new Set();for(const p of s.parts){if(!Number.isInteger(p.id)||ids.has(p.id)||!['healthy','ear','coat'].includes(p.condition)||![p.x,p.y,p.angle].every(Number.isFinite)||Math.abs(p.x)>2000||Math.abs(p.y)>2000||p.angle<0||p.angle>=360||!(p.slot===null||Number.isInteger(p.slot)&&p.slot>=0&&p.slot<9)||p.slot!==null&&slots.has(p.slot))throw Error('سطحه نامعتبر');ids.add(p.id);if(p.slot!==null){slots.add(p.slot);const t=M.slots[p.slot];if(Math.hypot(p.x-t.x,p.y-t.y)>1)throw Error('موقعیت نامعتبر')}}for(const j of s.joints)if(!Number.isFinite(j.offset)||Math.abs(j.offset)>6||![null,'fit','short'].includes(j.pin)||typeof j.locked!=='boolean'||typeof j.chain!=='boolean')throw Error('اتصال نامعتبر');for(const [id,a]of Object.entries(s.anchors))if(!M.anchors.some(x=>x.id===id)||!['side','light'].includes(a.kind)||!Number.isFinite(a.tension)||a.tension<0||a.tension>100)throw Error('مهار نامعتبر');s.passed=Simulation.evaluate(s).passed;if(s.stage==='success'&&!s.passed)s.stage='test';return s}
};
const api={create,Parts,Connections,Anchors,Simulation,Progress};root.BridgeModel=api;if(typeof module==='object')module.exports=api;
})(globalThis);
