const fs=require('node:fs'),path=require('node:path');const root=path.resolve(__dirname,'..'),dist=path.join(root,'dist');let html=fs.readFileSync(path.join(dist,'index.html'),'utf8');
html=html.replace('<link rel="stylesheet" href="style.css">',()=>'<style>'+fs.readFileSync(path.join(dist,'style.css'),'utf8')+'</style>');
for(const name of ['engine.js','chapter.js','art.js','app.js'])html=html.replace(`<script src="${name}"></script>`,()=>'<script>'+fs.readFileSync(path.join(dist,name),'utf8').replace(/<\/script/gi,'<\\/script')+'</script>');
fs.mkdirSync(path.join(root,'release'),{recursive:true});fs.writeFileSync(path.join(root,'release','sangarsazan.html'),html);console.log('Built release/sangarsazan.html (self-contained, no network required)');
