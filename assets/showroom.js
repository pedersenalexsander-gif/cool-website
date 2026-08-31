(() => {
  const tabs = [...document.querySelectorAll('[data-show-tab]')];
  const panels = [...document.querySelectorAll('[data-show-panel]')];
  const switchTab = name => {
    tabs.forEach(t => t.classList.toggle('active', t.dataset.showTab === name));
    panels.forEach(p => p.classList.toggle('active', p.dataset.showPanel === name));
    if (name === 'layout') requestAnimationFrame(render);
  };
  tabs.forEach(t => t.addEventListener('click', () => switchTab(t.dataset.showTab)));
  document.getElementById('tourFullscreen')?.addEventListener('click', () => {
    const iframe = document.getElementById('tourFrame');
    if (iframe?.requestFullscreen) iframe.requestFullscreen();
  });

  const room = document.getElementById('layoutRoom');
  if (!room) return;
  const widthInput = document.getElementById('layoutWidth');
  const depthInput = document.getElementById('layoutDepth');
  const panel = document.getElementById('selectionPanel');
  let selectedId = null;
  let roomData = {width:3000,depth:2400,floor:'stone',wall:'white',items:[]};
  try {
    const plan = JSON.parse(localStorage.getItem('ofotenPlanner') || 'null');
    if (plan) { roomData.width = (plan.width || 300) * 10; roomData.depth = (plan.depth || 240) * 10; }
    const saved = JSON.parse(localStorage.getItem('ofotenShowroom') || 'null');
    if (saved?.items) roomData = saved;
  } catch (_) {}
  widthInput.value = roomData.width;
  depthInput.value = roomData.depth;

  function parseProduct(btn) {
    try { return JSON.parse(btn.dataset.product); }
    catch (_) { return {id:'item',name:'Produkt',brand:'',size:'',img:btn.querySelector('img')?.src||'',url:'#',w:600,d:450}; }
  }
  function toast(text){
    let t=document.querySelector('.show-toast');
    if(!t){t=document.createElement('div');t.className='show-toast';document.body.appendChild(t)}
    t.textContent=text;t.classList.add('open');clearTimeout(t._timer);t._timer=setTimeout(()=>t.classList.remove('open'),1800);
  }
  function addProduct(product) {
    const item = {...product,instance:`${product.id}-${Date.now()}-${Math.random().toString(16).slice(2)}`,x:roomData.width/2,y:roomData.depth/2,rotation:0};
    roomData.items.push(item);selectedId=item.instance;switchTab('layout');render();toast(`${product.brand} ${product.name} lagt til`);
  }
  document.querySelectorAll('.show-product').forEach(btn => btn.addEventListener('click',()=>addProduct(parseProduct(btn))));

  const roomRect = () => room.getBoundingClientRect();
  const clampItem = item => {item.x=Math.max(0,Math.min(roomData.width,item.x));item.y=Math.max(0,Math.min(roomData.depth,item.y));};
  function positionElement(el,item,rect){
    const w=Math.max(34,item.w/roomData.width*rect.width),h=Math.max(34,item.d/roomData.depth*rect.height);
    el.style.width=`${Math.min(w,rect.width*.85)}px`;el.style.height=`${Math.min(h,rect.height*.85)}px`;
    el.style.left=`${item.x/roomData.width*rect.width}px`;el.style.top=`${item.y/roomData.depth*rect.height}px`;
    el.style.transform=`translate(-50%,-50%) rotate(${item.rotation}deg)`;
  }
  function render() {
    roomData.width=Math.max(1800,Math.min(6000,Number(widthInput.value)||3000));
    roomData.depth=Math.max(1800,Math.min(6000,Number(depthInput.value)||2400));
    document.getElementById('roomSizeLabel').textContent=`${roomData.width} × ${roomData.depth} mm`;
    document.getElementById('measureX').textContent=`${roomData.width} mm`;
    document.getElementById('measureY').textContent=`${roomData.depth} mm`;
    room.style.aspectRatio=`${roomData.width}/${roomData.depth}`;
    room.className=`layout-room floor-${roomData.floor} wall-${roomData.wall}`;
    room.querySelectorAll('.layout-item').forEach(x=>x.remove());
    const rect=roomRect();
    roomData.items.forEach(item=>{
      clampItem(item);
      const el=document.createElement('div');el.className=`layout-item${item.instance===selectedId?' selected':''}`;el.dataset.id=item.instance;
      el.innerHTML=`<img src="${item.img}" alt="${item.name}" onerror="this.style.display='none'"><span>${item.brand} ${item.name}</span>`;
      positionElement(el,item,rect);
      el.addEventListener('pointerdown',startDrag);
      el.addEventListener('click',e=>{e.stopPropagation();selectedId=item.instance;renderSelection();room.querySelectorAll('.layout-item').forEach(n=>n.classList.toggle('selected',n.dataset.id===selectedId));});
      room.appendChild(el);
    });
    renderSelection();
  }
  function startDrag(e){
    e.preventDefault();e.stopPropagation();
    const el=e.currentTarget,id=el.dataset.id,item=roomData.items.find(i=>i.instance===id),rect=roomRect();
    if(!item)return;selectedId=id;renderSelection();room.querySelectorAll('.layout-item').forEach(n=>n.classList.toggle('selected',n===el));
    const startX=e.clientX,startY=e.clientY,originX=item.x,originY=item.y;
    el.setPointerCapture(e.pointerId);
    const move=ev=>{item.x=originX+(ev.clientX-startX)/rect.width*roomData.width;item.y=originY+(ev.clientY-startY)/rect.height*roomData.depth;clampItem(item);positionElement(el,item,rect);renderSelection();};
    const up=()=>{el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);};
    el.addEventListener('pointermove',move);el.addEventListener('pointerup',up);
  }
  room.addEventListener('click',()=>{selectedId=null;room.querySelectorAll('.layout-item').forEach(n=>n.classList.remove('selected'));renderSelection();});
  function renderSelection(){
    const item=roomData.items.find(i=>i.instance===selectedId);
    if(!item){panel.className='selection-empty';panel.innerHTML='<h3>Ingen valgt</h3><p>Trykk på et produkt i rommet for å flytte, rotere, duplisere eller fjerne det.</p>';return}
    panel.className='selection-card';panel.innerHTML=`<div class="selection-card-head"><img src="${item.img}" alt=""><div><span>${item.brand}</span><h3>${item.name}</h3></div></div><div class="selection-meta"><div><small>Bredde</small><b>${item.w} mm</b></div><div><small>Dybde</small><b>${item.d} mm</b></div><div><small>X-posisjon</small><b>${Math.round(item.x)} mm</b></div><div><small>Y-posisjon</small><b>${Math.round(item.y)} mm</b></div></div><div class="selection-actions"><button data-act="left">← 50 mm</button><button data-act="right">50 mm →</button><button data-act="up">↑ 50 mm</button><button data-act="down">↓ 50 mm</button><button data-act="rotate">Roter 15°</button><button data-act="duplicate">Dupliser</button><button class="danger" data-act="remove">Fjern</button><button data-act="info">Produktinfo</button></div>`;
    panel.querySelectorAll('[data-act]').forEach(b=>b.addEventListener('click',()=>{
      const a=b.dataset.act;
      if(a==='info'){if(item.url&&item.url!=='#')window.open(item.url,'_blank','noopener');return}
      if(a==='left')item.x-=50;if(a==='right')item.x+=50;if(a==='up')item.y-=50;if(a==='down')item.y+=50;if(a==='rotate')item.rotation=(item.rotation+15)%360;
      if(a==='duplicate'){const c={...item,instance:`${item.id}-${Date.now()}`,x:item.x+100,y:item.y+100};roomData.items.push(c);selectedId=c.instance}
      if(a==='remove'){roomData.items=roomData.items.filter(i=>i.instance!==item.instance);selectedId=null}
      clampItem(item);render();
    }));
  }
  widthInput.addEventListener('change',render);depthInput.addEventListener('change',render);window.addEventListener('resize',()=>requestAnimationFrame(render));
  document.querySelectorAll('#floorMaterials [data-material]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('#floorMaterials button').forEach(x=>x.classList.remove('active'));b.classList.add('active');roomData.floor=b.dataset.material;render()}));
  document.querySelectorAll('#wallMaterials [data-material]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('#wallMaterials button').forEach(x=>x.classList.remove('active'));b.classList.add('active');roomData.wall=b.dataset.material;render()}));
  document.getElementById('saveLayout')?.addEventListener('click',()=>{localStorage.setItem('ofotenShowroom',JSON.stringify(roomData));toast('Layout lagret på denne enheten')});
  document.getElementById('resetLayout')?.addEventListener('click',()=>{if(confirm('Nullstille layouten?')){roomData.items=[];selectedId=null;localStorage.removeItem('ofotenShowroom');render()}});
  if(!roomData.items.length){
    const defaults=[...document.querySelectorAll('.show-product')].slice(0,4).map(parseProduct);
    defaults.forEach((p,i)=>roomData.items.push({...p,instance:`default-${i}`,x:[500,1900,2450,1200][i],y:[600,550,1500,1700][i],rotation:[0,0,90,0][i]}));
  }
  requestAnimationFrame(render);
})();
