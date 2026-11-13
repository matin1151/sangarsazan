(function(root,factory){if(typeof module==='object')module.exports=factory();else root.StoryEngine=factory()})(globalThis,function(){
 'use strict';
 const VERSION=1;
 class Engine{
 constructor(chapter,saved){this.chapter=chapter;this.nodes=chapter.nodes;this.state={version:VERSION,chapter:chapter.id,node:chapter.start,flags:{},journal:[],history:[],stats:{care:0,resolve:0},visited:[]};if(saved)this.restore(saved);this.enter()}
 current(){return this.nodes[this.state.node]}
 enter(){const n=this.current();if(!n)throw Error('Unknown node');if(!this.state.visited.includes(this.state.node)){this.state.visited.push(this.state.node);if(n.note)this.note(n.note);if(n.effects)this.effects(n.effects)}return n}
 note(note){if(!this.state.journal.some(x=>x.id===note.id))this.state.journal.push({...note})}
 effects(e){if(e.flags)Object.assign(this.state.flags,e.flags);if(e.stats)for(const [k,v]of Object.entries(e.stats))this.state.stats[k]=(this.state.stats[k]||0)+v;if(e.note)this.note(e.note)}
 available(){return (this.current().choices||[]).filter(c=>!c.requires||c.requires.every(f=>this.state.flags[f]))}
 go(id){if(!this.nodes[id])throw Error('Unknown destination: '+id);const n=this.current();this.state.history.push({node:this.state.node,speaker:n.speaker||'روایت',text:n.text||n.title||''});this.state.node=id;return this.enter()}
 next(){const n=this.current();if(['choice','inspect','puzzle','ending','comic'].includes(n.type))throw Error('Interaction required');return this.go(n.next)}
 comicPanel(){const n=this.current();if(n.type!=='comic')throw Error('Not a comic');return Math.min(this.state.comics?.[this.state.node]||0,n.panels.length-1)}
 advanceComic(){const n=this.current();if(n.type!=='comic')throw Error('Not a comic');const index=this.comicPanel();if(index<n.panels.length-1){if(!this.state.comics)this.state.comics={};this.state.comics[this.state.node]=index+1;return false}this.go(n.next);return true}
 previousComic(){const n=this.current();if(n.type!=='comic')throw Error('Not a comic');if(!this.state.comics)this.state.comics={};this.state.comics[this.state.node]=Math.max(0,this.comicPanel()-1)}
 choose(id){const c=this.available().find(x=>x.id===id);if(!c)throw Error('Choice unavailable');if(c.effects)this.effects(c.effects);this.state.history.push({speaker:'انتخاب شما',text:c.label});return this.go(c.next)}
 inspect(id){const n=this.current();if(n.type!=='inspect')throw Error('Not an inspection');const item=n.items.find(x=>x.id===id);if(!item)throw Error('Unknown evidence');this.state.flags[id]=true;if(item.note)this.note(item.note);return item}
 finishInspection(){const n=this.current();if(n.type!=='inspect')throw Error('Not an inspection');if(!n.required.every(x=>this.state.flags[x]))return false;this.go(n.next);return true}
 solve(order){const n=this.current();if(n.type!=='puzzle')throw Error('Not a puzzle');const ok=JSON.stringify(order)===JSON.stringify(n.solution);if(ok){this.effects({flags:{bridgeSolved:true},note:{id:'sequence',title:'ترتیب کار ثبت شد',text:'بازدید، آماده‌سازی قطعه، اتصال، بازبینی. این ترتیب صرفاً معمای داستانی است.'}});this.go(n.next)}return ok}
 export(){return JSON.stringify(this.state)}
 restore(raw){const s=typeof raw==='string'?JSON.parse(raw):raw;const obj=x=>x&&typeof x==='object'&&!Array.isArray(x);const str=x=>typeof x==='string'&&x.length<=10000;
 if(!s||s.version!==VERSION||s.chapter!==this.chapter.id||!Object.hasOwn(this.nodes,s.node)||!Array.isArray(s.journal)||!Array.isArray(s.history)||!Array.isArray(s.visited)||!obj(s.flags)||!obj(s.stats))throw Error('Invalid save');
 if(s.journal.length>300||s.history.length>2000||s.visited.length>Object.keys(this.nodes).length||s.visited.some(x=>!Object.hasOwn(this.nodes,x))||s.journal.some(x=>!obj(x)||!str(x.id)||!str(x.title)||!str(x.text))||s.history.some(x=>!obj(x)||!str(x.speaker)||!str(x.text))||Object.entries(s.flags).some(([k,v])=>!/^\w{1,80}$/.test(k)||['__proto__','constructor','prototype'].includes(k)||typeof v!=='boolean')||Object.values(s.stats).some(x=>!Number.isFinite(x)||x<0||x>10000)||!Number.isFinite(s.stats.care)||!Number.isFinite(s.stats.resolve))throw Error('Invalid save data');
 if(s.comics!==undefined&&(!obj(s.comics)||Object.entries(s.comics).some(([k,v])=>!Object.hasOwn(this.nodes,k)||this.nodes[k].type!=='comic'||!Number.isInteger(v)||v<0||v>=this.nodes[k].panels.length)))throw Error('Invalid comic save');
 this.state=JSON.parse(JSON.stringify(s))}
 }
 function validate(c){if(!c.nodes[c.start])throw Error('Invalid start');for(const [id,n] of Object.entries(c.nodes)){for(const dest of [n.next,...(n.choices||[]).map(x=>x.next)].filter(Boolean))if(!c.nodes[dest])throw Error(id+' → '+dest);if(n.type==='puzzle'&&(!n.solution||new Set(n.solution).size!==n.items.length))throw Error('Invalid puzzle');if(n.type==='comic'&&(!Array.isArray(n.panels)||!n.panels.length||n.panels.some(p=>typeof p.text!=='string'||typeof p.frame!=='number')))throw Error('Invalid comic')}return true}
 return {Engine,validate,VERSION};
});
