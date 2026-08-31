const state={projectType:'Totalrenovere eksisterende bad',users:'Familie',style:'Lys nordisk',budget:'comfort'};
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];

function bindSingle(group){
  $(`[data-single="${group}"]`)?.addEventListener('click',e=>{
    const btn=e.target.closest('button'); if(!btn)return;
    $(`[data-single="${group}"]`).querySelectorAll('button').forEach(b=>b.classList.remove('selected'));
    btn.classList.add('selected'); state[group]=btn.dataset.value;
  });
}
['projectType','users','style','budget'].forEach(bindSingle);

$$('.multi').forEach(group=>group.addEventListener('click',e=>{
  const btn=e.target.closest('button'); if(!btn)return;
  if(group.id==='priorities'&&!btn.classList.contains('selected')&&group.querySelectorAll('.selected').length>=3)return;
  btn.classList.toggle('selected');
}));

function go(step){
  $$('.step-pane').forEach(p=>p.classList.toggle('active',+p.dataset.pane===step));
  $$('.progress-item').forEach(item=>{
    const n=+item.dataset.step; item.classList.toggle('active',n===step); item.classList.toggle('done',n<step);
    const circle=item.querySelector('i'); circle.textContent=n<step?'✓':n;
  });
  document.querySelector('.advisor-shell').scrollIntoView({behavior:'smooth',block:'start'});
}
$$('.next').forEach(b=>b.onclick=()=>go(+b.dataset.next));
$$('.back').forEach(b=>b.onclick=()=>go(+b.dataset.back));

function selectedValues(id){return $$(`#${id} .selected`).map(x=>x.dataset.value)}
function formatNok(n){return new Intl.NumberFormat('nb-NO',{maximumFractionDigits:0}).format(n)+' kr'}

$('#generate').onclick=()=>{
  const size=+$('#size').value;
  const home=$('#home').value;
  const timing=$('#timing').value;
  const text=$('#freeText').value.trim();
  const features=selectedValues('features');
  const priorities=selectedValues('priorities');
  const levels={smart:{label:'Smart',base:220000,m2:12000},comfort:{label:'Komfort',base:275000,m2:15500},premium:{label:'Premium',base:350000,m2:21000}};
  const lvl=levels[state.budget];
  let center=lvl.base+(size*lvl.m2)+(features.length*3500);
  if(state.projectType==='Bygge nytt bad')center+=35000;
  const low=Math.round((center*.88)/10000)*10000, high=Math.round((center*1.18)/10000)*10000;
  const styleNames={'Lys nordisk':'lyst og tidløst','Mørk moderne':'moderne med tydelige kontraster','Varm natur':'varmt og naturlig'};
  const userText=state.users==='Familie'?'familiebad':state.users==='Gjester'?'gjestebad':'bad for 1–2 personer';
  $('#resultTitle').textContent=`Et ${styleNames[state.style]} ${userText}`;
  $('#solutionName').textContent=`${lvl.label} ${userText} · ca. ${size} m²`;
  $('#solutionIntro').textContent=`Vi ville startet med en plan som prioriterer ${priorities.slice(0,2).join(' og ').toLowerCase()||'god funksjon'}. For ${state.users.toLowerCase()} gir det mening å holde sonene ryddige og velge løsninger som tåler daglig bruk.`;
  $('#priceRange').textContent=`${formatNok(low)} – ${formatNok(high)}`;
  $('#resultFeatures').innerHTML=features.map(f=>`<div>${f}</div>`).join('')||'<div>Funksjoner avklares på befaring</div>';
  $('#summaryStrip').innerHTML=`<div><small>Prosjekt</small><b>${state.projectType}</b></div><div><small>Størrelse</small><b>Ca. ${size} m²</b></div><div><small>Bolig</small><b>${home}</b></div><div><small>Stil</small><b>${state.style}</b></div>`;
  let note=`For et bad på rundt ${size} m² ville jeg først avklart plassering av sluk, vann og eksisterende tekniske forhold. `;
  if(features.includes('Dobbel servant'))note+=`Dobbel servant er praktisk for flere brukere, men vi bør kontrollere at den ikke tar for mye av gangarealet. `;
  if(features.includes('Badekar')&&features.includes('Dusj med glassvegger'))note+=`Siden du ønsker både badekar og dusj bør planløsningen vurderes nøye for å unngå et trangt rom. `;
  if(priorities.includes('Enkel rengjøring'))note+=`Store, sammenhengende flater og færre vanskelige hjørner vil støtte ønsket om enklere rengjøring. `;
  note+=`Neste fornuftige steg er en befaring før produkter, fast pris eller fremdrift låses.`;
  if(text)note+=` Beskrivelsen din – «${text.slice(0,120)}${text.length>120?'…':''}» – bør tas med videre i behovsavklaringen.`;
  $('#aiNote').textContent=note;
  $('#matchScore').textContent=(90+Math.min(features.length,5))+'%';
  go(4);
};
$('#restart').onclick=()=>go(1);
