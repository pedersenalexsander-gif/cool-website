(() => {
  const root = document.getElementById('planner');
  if (!root) return;
  const state = {project:'Totalrenovering', users:'Familie', style:'Lys nordisk', level:'Komfort'};
  const $ = s => root.querySelector(s);
  const $$ = s => [...root.querySelectorAll(s)];

  root.addEventListener('click', e => {
    const choice = e.target.closest('.choice');
    if (choice) {
      const single = choice.closest('[data-single]');
      if (single) {
        single.querySelectorAll('.choice').forEach(c => c.classList.remove('selected'));
        choice.classList.add('selected');
        state[single.dataset.single] = choice.dataset.value;
      } else choice.classList.toggle('selected');
    }
    const next = e.target.closest('[data-next]');
    const back = e.target.closest('[data-back]');
    if (next) go(Number(next.dataset.next));
    if (back) go(Number(back.dataset.back));
  });

  function go(step) {
    $$('.planner-pane').forEach(p => p.classList.toggle('active', Number(p.dataset.pane) === step));
    $$('.planner-step').forEach(s => {
      const n = Number(s.dataset.step);
      s.classList.toggle('active', n === step);
      s.classList.toggle('done', n < step);
      const i = s.querySelector('i'); if (i) i.textContent = n < step ? '✓' : n;
    });
    root.scrollIntoView({behavior:'smooth',block:'start'});
  }
  function features() { return $$('#featureChoices .choice.selected').map(c => c.dataset.value); }
  function clamp(n,min,max){ return Math.max(min,Math.min(max,n)); }
  function productHtml(products){ return products.map(p => `<div class="recommend-item"><img src="${p.img}" alt=""><div><b>${p.brand} ${p.name}</b><span>${p.size}</span></div></div>`).join(''); }
  const products = [
    {name:'AquaClean Mera',brand:'Geberit',img:'https://www.geberit.no/_assetsmaster/global-media/pictures/gac/products/mera/aquaclean-mera-comfort-white-1600-900.jpg',size:'395 × 590 mm',tags:['WC','Dusjtoalett']},
    {name:'Rainfinity Showerpipe 250',brand:'hansgrohe',img:'https://assets.hansgrohe.com/mam/celum/celum_assets/154__hpr02052_tif.png?format=HBW2',size:'250 mm hodedusj',tags:['Dusj']},
    {name:'Linc 2 Original',brand:'INR',img:'https://www.inr.no/Gryphon/ScaledImagesCache/InrPricedItemThumb/100532-27.jpg',size:'Dusjvegg',tags:['Dusj']},
    {name:'Luna dobbel servant 121',brand:'Dansani',img:'https://vvsplus.dk/cdn/shop/files/780996270-dansani-luna-moebel-mat-hvid-121-cm-1.jpg?v=1763970620',size:'1210 × 455 mm',tags:['Dobbel servant','Oppbevaring']},
    {name:'Dybe Rett 180',brand:'VikingBad',img:'https://www.bademiljo.no/globalassets/bluestone-assets/image/vikingbad-dybe-badekar-6135116..jpg',size:'1800 × 810 mm',tags:['Badekar']}
  ];

  function drawPlan(widthCm, depthCm, list) {
    const w = widthCm * 10, d = depthCm * 10;
    const shower = list.includes('Dusj');
    const tub = list.includes('Badekar');
    const vanity = list.includes('Dobbel servant');
    const laundry = list.includes('Vaskesone');
    return `<div style="display:flex;justify-content:space-between;gap:10px;margin-bottom:10px"><b style="font-size:11px">Veiledende plan</b><span style="font-size:9px;color:#087c9d;font-weight:800">${w} × ${d} mm</span></div><svg viewBox="0 0 700 470" role="img" aria-label="Veiledende plantegning"><defs><pattern id="pg" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#e4eaeb"/></pattern></defs><rect x="95" y="65" width="500" height="330" rx="2" fill="url(#pg)" stroke="#102f43" stroke-width="8"/><path d="M95 302h80v93" stroke="#fff" stroke-width="12"/><path d="M99 302a91 91 0 0 1 91 91" fill="none" stroke="#7b8a90" stroke-width="2"/>${shower?'<rect x="420" y="88" width="145" height="130" rx="4" fill="#dff2f7" stroke="#0a87a8" stroke-width="3"/><text x="492" y="157" text-anchor="middle" font-size="15">DUSJ</text>':''}${tub?'<rect x="125" y="88" width="250" height="82" rx="35" fill="#f2f4f3" stroke="#829095" stroke-width="2"/><text x="250" y="134" text-anchor="middle" font-size="14">BADEKAR</text>':''}<rect x="${vanity?365:420}" y="310" width="${vanity?200:145}" height="55" fill="#e8d4bd" stroke="#6f665c"/><text x="${vanity?465:492}" y="342" text-anchor="middle" font-size="13">${vanity?'DOBBEL SERVANT':'SERVANT'}</text><ellipse cx="210" cy="250" rx="38" ry="50" fill="#fff" stroke="#829095" stroke-width="2"/><text x="210" y="255" text-anchor="middle" font-size="12">WC</text>${laundry?'<rect x="300" y="300" width="62" height="62" rx="4" fill="#fff" stroke="#829095"/><circle cx="331" cy="331" r="20" fill="none" stroke="#829095"/><text x="331" y="380" text-anchor="middle" font-size="10">VASK</text>':''}<line x1="95" y1="38" x2="595" y2="38" stroke="#087c9d"/><text x="345" y="27" text-anchor="middle" font-size="13">${w} mm</text><line x1="623" y1="65" x2="623" y2="395" stroke="#087c9d"/><text x="651" y="230" text-anchor="middle" font-size="13" transform="rotate(90 651 230)">${d} mm</text></svg><p style="font-size:8px;color:#657782;line-height:1.5;margin:8px 0 0">Skissen er automatisk generert. Dør, vindu, sluk, rørføringer og våtromskrav må måles og vurderes på befaring.</p>`;
  }

  document.getElementById('generatePlan')?.addEventListener('click', () => {
    const width = clamp(Number($('#roomWidth').value) || 300,180,600);
    const depth = clamp(Number($('#roomDepth').value) || 240,180,600);
    const list = features();
    const area = (width * depth / 10000).toFixed(1).replace('.',',');
    const plan = {project:state.project,users:state.users,style:state.style,level:state.level,width,depth,features:list,home:$('#homeType').value,postal:$('#postal').value,timing:$('#timing').value,notes:$('#notes').value};
    localStorage.setItem('ofotenPlanner',JSON.stringify(plan));
    $('#planTitle').textContent = `${state.style} ${state.users === 'Familie' ? 'familiebad' : 'bad'}`;
    $('#resultSummary').innerHTML = `<div><small>Prosjekt</small><b>${state.project}</b></div><div><small>Rom</small><b>${width} × ${depth} cm</b></div><div><small>Areal</small><b>${area} m²</b></div><div><small>Nivå</small><b>${state.level}</b></div>`;
    $('#planDrawing').innerHTML = drawPlan(width,depth,list);
    const focus = list.includes('Badekar') && list.includes('Dusj') && width*depth < 85000 ? 'Plassutnyttelse må prioriteres nøye når både dusj og badekar skal inn.' : 'Planen prioriterer gode gangsoner, oppbevaring og enkel daglig bruk.';
    $('#planDirection').textContent = `${state.style} · ${state.level}`;
    $('#planText').textContent = `${focus} Endelig plassering styres av eksisterende vann, avløp, sluk, dør og vindu.`;
    const picks = products.filter(p => p.tags.some(t => list.includes(t))).slice(0,4);
    $('#recommendations').innerHTML = productHtml(picks.length ? picks : products.slice(0,3));
    $('#budgetLabel').textContent = state.level === 'Smart' ? 'Funksjonelt standardnivå' : state.level === 'Premium' ? 'Utvidet premium-nivå' : 'Komfortnivå';
    $('#budgetText').textContent = 'Bindende pris kan ikke beregnes digitalt. Befaring, teknisk omfang og konkrete produktvalg avgjør tilbudet.';
    $('#nextList').innerHTML = `<li>${$('#contactPreference').value}</li><li>Kontroll av faktiske mål</li><li>Produkt- og materialvalg</li>`;
    go(4);
  });
  document.getElementById('editPlan')?.addEventListener('click',()=>go(1));
})();
