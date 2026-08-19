import fs from 'node:fs';
const jsFiles=['gamehub.js','expansion.js','advanced-games.js','advanced-pack.js','advanced-worlds.js','unique-games.js','stability.js','portal.js'];
const cssFiles=['gamehub.css','expansion.css','advanced-pack.css','advanced-worlds.css','unique-games.css','portal.css'];
const html=fs.readFileSync('index.html','utf8');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
const duplicates=ids.filter((id,i)=>ids.indexOf(id)!==i);
if(duplicates.length) throw new Error('Duplicate HTML ids: '+[...new Set(duplicates)].join(', '));
for(const file of [...jsFiles,...cssFiles]){if(!fs.existsSync(file))throw new Error('Missing '+file);if(!fs.readFileSync(file,'utf8').trim())throw new Error('Empty '+file);}
const requiredIds=['modal','stage','gameTitle','closeGame','games','portalContent','portalSearch','coins','xp','level','leaders','achievements'];
for(const id of requiredIds){if(!ids.includes(id))throw new Error('Missing required HTML id: '+id);}
const scripts=[...html.matchAll(/<script src="([^"]+)"/g)].map(m=>m[1]);for(const file of jsFiles){if(!scripts.includes(file))throw new Error(file+' is not loaded by index.html');}
const styles=[...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(m=>m[1]);for(const file of cssFiles){if(!styles.includes(file))throw new Error(file+' is not loaded by index.html');}
const advanced=fs.readFileSync('advanced-worlds.js','utf8')+fs.readFileSync('advanced-pack.js','utf8')+fs.readFileSync('advanced-games.js','utf8');for(const token of ['games.race=','games.aim=','games.pong=','games.maze=','games.x21=','games.x23=','games.x30=']){if(!advanced.includes(token))throw new Error('Expected advanced engine missing: '+token);}
const unique=fs.readFileSync('unique-games.js','utf8');for(const token of ['games.x36=','games.x37=','games.x38=','games.x39=','games.x40=','games.x41=','games.x42=','games.x43=','games.x44=','games.x45=']){if(!unique.includes(token))throw new Error('Unique engine missing: '+token);}
if(!unique.includes('GAMES.splice(35)'))throw new Error('Reskinned template catalog is not being removed');
const portal=fs.readFileSync('portal.js','utf8');for(const token of ['renderPortal','portal-card','gamehub_favs','gamehub_recent']){if(!portal.includes(token))throw new Error('Portal feature missing: '+token);}
console.log('Unique-engine portal smoke checks passed');