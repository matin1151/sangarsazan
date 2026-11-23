(function(root){
'use strict';
const angles=[0,0,30,60,30,0,-30,-30,0],length=82,width=42;
let end={x:110,y:160};
const slots=angles.map((angle,id)=>{const a=angle*Math.PI/180,start={...end};end={x:start.x+Math.cos(a)*length,y:start.y+Math.sin(a)*length};return {id,angle,x:(start.x+end.x)/2,y:(start.y+end.y)/2,start,end:{...end}}});
const anchors=[1,3,5,7].flatMap(slot=>[-1,1].map(side=>{const p=slots[slot],a=p.angle*Math.PI/180;return {id:`${slot}:${side}`,slot,side,x:p.x-Math.sin(a)*side*100,y:p.y+Math.cos(a)*side*100}}));
const api={slots,anchors,length,width,angleError:(a,b)=>Math.abs(((a-b+540)%360)-180),nearest:(x,y)=>slots.reduce((a,b)=>Math.hypot(b.x-x,b.y-y)<Math.hypot(a.x-x,a.y-y)?b:a)};
root.BridgeMap=api;if(typeof module==='object')module.exports=api;
})(globalThis);
