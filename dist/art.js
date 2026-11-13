(function(){
'use strict';
const assets={night:'assets/shore-night.webp',comic:'assets/briefing-comic.webp',characters:'assets/characters.webp',workshop:'assets/workshop.webp'};
// Display viewports preserve the complete source page; no generated art is cropped on disk.
const frames=[[8,4,1106,344],[8,364,475,319],[513,364,600,319],[9,700,1103,301],[8,1018,561,376],[625,1018,486,376]];
function frame(index,label=''){const [x,y,w,h]=frames[index]||frames[0];return '<svg class="comic-frame" viewBox="'+x+' '+y+' '+w+' '+h+'" preserveAspectRatio="xMidYMid slice" role="img" aria-label="'+label+'"><image href="'+assets.comic+'" x="0" y="0" width="1122" height="1402"/></svg>'}
const fullNight='<img class="scenery-image" src="'+assets.night+'" alt="" decoding="async">';
const scenes={marsh:fullNight,bridge:fullNight,tent:'<img class="scenery-image" src="'+assets.workshop+'" alt="" decoding="async">',workshop:'<img class="scenery-image" src="'+assets.workshop+'" alt="" decoding="async">',dawn:frame(4)};
function portrait(who){const mentor=who==='mentor';if(!mentor&&who!=='player')return '';return '<div class="character-crop '+(mentor?'character-mentor':'character-mohammad')+'"><img src="'+assets.characters+'" alt="" decoding="async"></div>'}
window.GameArt={assets,frames,scenes,frame,portrait};
})();
