(function(root){
'use strict';
const M=BridgeMap;
class Renderer{
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.w=1000;this.h=560}
 resize(){const r=this.canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);this.canvas.width=r.width*d;this.canvas.height=r.height*d;this.scale=Math.min(r.width/1000,r.height/560)*(this.zoom||1);this.ox=(r.width-1000*this.scale)/2+(this.pan||0)*this.scale;this.oy=(r.height-560*this.scale)/2;this.ctx.setTransform(d,0,0,d,0,0)}
 project(x,y,z=0){return {x:80+x*.97-y*.20,y:60+y*.88+x*.06-z}}
 unproject(x,y){const a=x-80,b=y-60;return {x:(a*.88+b*.20)/.8656,y:(b*.97-a*.06)/.8656}}
 point(clientX,clientY){const r=this.canvas.getBoundingClientRect();return this.unproject((clientX-r.left-this.ox)/this.scale,(clientY-r.top-this.oy)/this.scale)}
 screen(x,y){const p=this.project(x,y),r=this.canvas.getBoundingClientRect();return {x:r.left+this.ox+p.x*this.scale,y:r.top+this.oy+p.y*this.scale}}
 polygon(points,fill,stroke){const c=this.ctx;c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.stroke()}}
 polyWorld(points,z,fill,stroke){this.polygon(points.map(p=>this.project(p.x,p.y,z)),fill,stroke)}
 circle(p,r,fill,stroke){const c=this.ctx;c.beginPath();c.arc(p.x,p.y,r,0,Math.PI*2);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.stroke()}}
 line(a,b,color,width=2){const c=this.ctx;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.strokeStyle=color;c.lineWidth=width;c.stroke()}
 text(t,p,color='#f0dfaa',size=14){const c=this.ctx;c.font=`${size}px Tahoma`;c.textAlign='center';c.fillStyle=color;c.fillText(t,p.x,p.y)}
 corners(p){const a=p.angle*Math.PI/180;return [[-39,-21],[39,-21],[39,21],[-39,21]].map(([x,y])=>({x:p.x+x*Math.cos(a)-y*Math.sin(a),y:p.y+x*Math.sin(a)+y*Math.cos(a)}))}
 draw(s,ui,time){this.resize();const c=this.ctx;c.clearRect(0,0,this.canvas.width,this.canvas.height);c.save();c.translate(this.ox,this.oy);c.scale(this.scale,this.scale);
 const board=[{x:35,y:30},{x:890,y:30},{x:890,y:490},{x:35,y:490}];this.polyWorld(board.map(p=>({...p,y:p.y+17})),0,'#38291c','#b39864');this.polyWorld(board,0,'#78603e','#b89a64');const water=[{x:50,y:45},{x:875,y:45},{x:875,y:475},{x:50,y:475}];this.polyWorld(water,0,'#335d57','#9e8557');
 // Animated water glints, clipped to the independent water surface.
 c.save();const ws=water.map(p=>this.project(p.x,p.y));c.beginPath();ws.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();c.clip();for(let i=0;i<110;i++){let x=55+(i*97)%810,y=50+(i*53)%420;const p=this.project(x+Math.sin(time*.001+i)*8,y);this.line(p,{x:p.x+9+Math.sin(i+time*.001)*5,y:p.y-1},`rgba(206,224,174,${.07+.07*Math.sin(time*.0007+i)})`,1)}c.restore();
 // Reed beds on the model shore; deterministic placement keeps the scene stable.
 for(let i=0;i<85;i++){const x=60+(i*41)%790,y=i%2?57+(i%4)*6:445+(i%4)*5,p=this.project(x,y);this.circle(p,6,'#526343');for(let k=0;k<3;k++)this.line(p,{x:p.x+k*3-3,y:p.y-12-(i%11)},k===1?'#b3ad65':'#74834c',1.5)}
 c.setLineDash([7,5]);for(const t of M.slots){const corners=this.corners(t);this.polyWorld(corners,2,'rgba(219,208,147,.045)','#d8cb94');this.line(this.project(t.start.x,t.start.y,3),this.project(t.end.x,t.end.y,3),'#b5c5a0',1)}c.setLineDash([]);
 this.text('شروع',this.project(100,135,8));this.text('پایان',this.project(815,325,8));this.text('پیچ اول',this.project(350,160,4),'#ead29a',13);this.text('پیچ دوم',this.project(600,345,4),'#ead29a',13);
 const phase=ui.testing?Math.min(1,(time-ui.testStart)/6500):0;const outcome=ui.result;
 const displaced=p=>{const d=(ui.testing||ui.showResult)&&outcome&&p.slot!==null?outcome.drift[p.slot]:null;return d?{...p,x:p.x+d.x*Math.min(1,phase*5||1)+Math.sin(time*.004+p.id)*d.amplitude,y:p.y+d.y*Math.min(1,phase*5||1)}:p};
 for(const a of M.anchors){const pos=this.project(a.x,a.y),v=s.anchors[a.id];if(s.stage==='anchor'||s.stage==='test'||ui.showResult){this.circle(pos,15,v?'#ad8c51':'#243e35',ui.anchor===a.id?'#ffe5a2':'#c7b37b');this.text(v?'●':'+',{x:pos.x,y:pos.y+5},'#f8e7b3',18)}if(v){const part=s.parts.find(p=>p.slot===a.slot);if(part){const p=displaced(part),to=this.project(p.x,p.y,8);const slack=(100-v.tension)*.22;c.beginPath();c.moveTo(pos.x,pos.y);c.quadraticCurveTo((pos.x+to.x)/2,(pos.y+to.y)/2+slack,to.x,to.y);c.strokeStyle=v.kind==='side'?'#c7b079':'#8e8c75';c.lineWidth=v.kind==='side'?3:1.5;c.stroke()}}}
 for(const original of [...s.parts].sort((a,b)=>a.y-b.y)){const p=displaced(original),corners=this.corners(p),top=corners.map(q=>this.project(q.x,q.y,10)),bottom=corners.map(q=>this.project(q.x,q.y,0));this.polygon(bottom.map(q=>({x:q.x+5,y:q.y+5})),'#1c302f88');for(let i=1;i<4;i++)this.polygon([top[i],top[(i+1)%4],bottom[(i+1)%4],bottom[i]],'#4d5136','#353929');const bad=ui.errors?.some(e=>e.index===p.slot);this.polygon(top,p.condition==='coat'?'#9a9272':'#969771',original.id===ui.selected?'#ffe2a0':bad?'#ed8262':'#dad6a5');const a=p.angle*Math.PI/180;for(let n=-2;n<=2;n++){const q={x:p.x+n*13*Math.cos(a),y:p.y+n*13*Math.sin(a)};this.line(this.project(q.x-15*Math.sin(a),q.y+15*Math.cos(a),11),this.project(q.x+15*Math.sin(a),q.y-15*Math.cos(a),11),'#707653',1)}for(let k=0;k<4;k++)this.circle(top[k],4,k===0&&p.condition==='ear'?'#d66c49':'#c3bd96','#4e533d');if(p.condition==='coat'){const q=this.project(p.x,p.y,12);this.line({x:q.x-12,y:q.y-6},{x:q.x+10,y:q.y+5},'#5b3428',4)}this.text(String((p.slot??p.id)+1),this.project(p.x,p.y,11),'#303b2b',12)}
 if(s.stage!=='intro'&&s.stage!=='place')for(let i=0;i<8;i++){const t=M.slots[i],p=this.project(t.end.x,t.end.y,14),status=BridgeModel.Connections.status(s,i);this.circle(p,12,status==='صحیح'?'#799a54':status==='ناقص'?'#c88c44':'#263d37',ui.joint===i?'#fff1ae':'#d7c68e');this.text(String(i+1),{x:p.x,y:p.y+4},'#fff3cc',11);if((ui.testing||ui.showResult)&&outcome?.errors.some(e=>e.stage==='connect'&&e.index===i))this.line({x:p.x-8,y:p.y-8},{x:p.x+8,y:p.y+8},'#ff7755',3)}
 if(ui.testing){const u=phase*9,index=Math.min(8,Math.floor(u)),t=M.slots[index],f=Math.min(1,u-index),p=this.project(t.start.x+(t.end.x-t.start.x)*f,t.start.y+(t.end.y-t.start.y)*f,28);this.polygon([{x:p.x-12,y:p.y-9},{x:p.x+12,y:p.y-9},{x:p.x+15,y:p.y+8},{x:p.x-9,y:p.y+8}],'#c7a25e','#ffe0a0');this.text('بار ماکت',{x:p.x,y:p.y-17},'#fff0c8',12)}
 if(ui.ghost){const p=this.project(ui.ghost.x,ui.ghost.y,20);this.circle(p,18,'#e4cc8544','#ffe8a8')}
 c.restore();}
}
root.BridgeRenderer=Renderer;
})(globalThis);
