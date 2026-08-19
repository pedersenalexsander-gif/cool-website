import fs from 'node:fs';
const jsFiles=['gamehub.js','expansion.js','advanced-games.js','advanced-pack.js','advanced-worlds.js','catalog.js','stability.js'];
const html=fs.readFileSync('index.html','utf8');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
const duplicates=ids.filter((id,i)=>ids.indexOf(id)!==i);
if(duplicates.length) throw new Error('Duplicate HTML ids: '+[...new Set(duplicates)].join(', '));
for(const file of jsFiles){if(!fs.existsSync(file))throw new Error('Missing '+file);const src=fs.readFileSync(file,'utf8');if(!src.trim())throw new Error('Empty '+file);}
const requiredIds=['modal','stage','gameTitle','closeGame','games','coins','xp','level'];
for(const id of requiredIds){if(!ids.includes(id))throw new Error('Missing required HTML id: '+id);}
const scripts=[...html.matchAll(/<script src="([^"]+)"/g)].map(m=>m[1]);
for(const file of jsFiles){if(!scripts.includes(file))throw new Error(file+' is not loaded by index.html');}
const advanced=fs.readFileSync('advanced-worlds.js','utf8')+fs.readFileSync('advanced-pack.js','utf8')+fs.readFileSync('advanced-games.js','utf8');
for(const token of ['games.race=','games.aim=','games.pong=','games.maze=','games.x21=','games.x23=','games.x30=']){if(!advanced.includes(token))throw new Error('Expected advanced engine missing: '+token);}
if(/id="games"[\s\S]*id="games"/.test(html)) throw new Error('games id appears more than once');
console.log('Static smoke checks passed');
