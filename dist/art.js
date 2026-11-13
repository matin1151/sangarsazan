(function(){
'use strict';
const assets={night:'assets/shore-night.webp',comic:'assets/briefing-comic.webp',characters:'assets/characters.webp',workshop:'assets/workshop.webp',scene1:'assets/khaybar-scene-1.webp',scene2:'assets/khaybar-scene-2.webp',scene3:'assets/khaybar-scene-3.webp',scene4:'assets/khaybar-scene-4.webp',scene5:'assets/khaybar-scene-5.webp',scene6:'assets/khaybar-scene-6.webp'};
// Display viewports preserve the complete source page; no generated art is cropped on disk.
const frames=[[8,4,1106,344],[8,364,475,319],[513,364,600,319],[9,700,1103,301],[8,1018,561,376],[625,1018,486,376]];
function frame(index,label=''){const [x,y,w,h]=frames[index]||frames[0];return '<svg class="comic-frame" viewBox="'+x+' '+y+' '+w+' '+h+'" preserveAspectRatio="xMidYMid slice" role="img" aria-label="'+label+'"><image href="'+assets.comic+'" x="0" y="0" width="1122" height="1402"/></svg>'}
const fullNight='<img class="scenery-image" src="'+assets.night+'" alt="" decoding="async">';
const illustrated={arrival:assets.scene1,portrait:assets.scene2,planning:assets.scene3,question:assets.scene4,pontoon:assets.scene5,dawn:assets.scene6};
const scenes={marsh:fullNight,bridge:fullNight,tent:'<img class="scenery-image" src="'+assets.workshop+'" alt="" decoding="async">',workshop:'<img class="scenery-image" src="'+assets.workshop+'" alt="" decoding="async">',dawn:frame(4)};for(const [id,src] of Object.entries(illustrated))scenes[id]='<img class="scenery-image" src="'+src+'" alt="" decoding="async">';
function portrait(who,pose='neutral'){const mentor=who==='mentor';if(!mentor&&who!=='player')return '';const name=mentor?'mentor':'mohammad';const variants={thoughtful:'thoughtful',determined:'determined',alert:'alert',explaining:'explaining',questioning:'questioning',approving:'approving',serious:'serious'};const variant=variants[pose];const fallback='<div class="character-crop '+(mentor?'character-mentor':'character-mohammad')+' pose-'+pose+'"><img src="'+assets.characters+'" alt="" decoding="async"></div>';return fallback}
window.GameArt={assets,frames,scenes,illustrated,frame,portrait};
})();
