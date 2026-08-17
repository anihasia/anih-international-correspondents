let correspondents = [];
const drawer = document.getElementById('profileDrawer');
const directory = document.getElementById('directory');
const wuHotspot = document.getElementById('wuHotspot');
const mapStage = document.getElementById('mapStage');

async function loadData(){
  const response = await fetch('data/correspondents.json');
  correspondents = await response.json();
  renderDirectory();
  positionHotspot(correspondents[0]);
}

function positionHotspot(person){
  if(!person?.map_hotspot) return;
  const h = person.map_hotspot;
  wuHotspot.style.left = h.left + '%';
  wuHotspot.style.top = h.top + '%';
  wuHotspot.style.width = h.size + '%';
}

function openProfile(person){
  document.getElementById('profileCountry').innerHTML = `${person.country_zh} <span>${person.country_en}</span>`;
  document.getElementById('profilePhoto').src = person.photo;
  document.getElementById('profilePhoto').alt = person.name_en;
  document.getElementById('profileNameZh').textContent = person.name_zh;
  document.getElementById('profileNameEn').textContent = person.nickname ? `${person.name_en} (${person.nickname})` : person.name_en;
  document.getElementById('profileTitleZh').textContent = person.title_zh;
  document.getElementById('profileTitleEn').textContent = person.title_en;
  document.getElementById('profileOrgZh').textContent = person.organization_zh;
  document.getElementById('profileOrgEn').textContent = person.organization_en;
  document.getElementById('profileBioZh').textContent = person.bio_zh;
  document.getElementById('profileBioEn').textContent = person.bio_en;

  const h = person.heritage;
  document.getElementById('heritageImage').src = h.image;
  document.getElementById('heritageImage').alt = h.name_en;
  document.getElementById('heritageNameZh').textContent = h.name_zh;
  document.getElementById('heritageNameEn').textContent = h.name_en;
  document.getElementById('heritageLocation').textContent = `${h.location_zh}・${h.country_zh} / ${h.location_en}, ${h.country_en}`;
  document.getElementById('heritageType').textContent = `${h.type_zh} / ${h.type_en}`;
  document.getElementById('heritageBy').textContent = `${person.name_zh} / ${person.name_en}`;
  document.getElementById('heritageDescZh').textContent = h.description_zh;
  document.getElementById('heritageDescEn').textContent = h.description_en;
  document.getElementById('heritageMapLink').href = h.google_maps;

  closeDirectory();
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden';
  setTimeout(()=>drawer.querySelector('.drawer-close').focus(),60);
}

function closeProfile(){
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden','true');
  document.body.style.overflow='';
}
function openDirectory(){
  directory.classList.add('open');
  directory.setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden';
}
function closeDirectory(){
  directory.classList.remove('open');
  directory.setAttribute('aria-hidden','true');
  if(!drawer.classList.contains('open')) document.body.style.overflow='';
}
function renderDirectory(){
  const root = document.getElementById('directoryList');
  root.innerHTML='';
  correspondents.forEach(person=>{
    const btn=document.createElement('button');
    btn.className='directory-card';
    btn.innerHTML=`<img src="${person.photo}" alt=""><span><b>${person.name_zh} <small>${person.name_en}</small></b><small>${person.country_zh} · ${person.country_en}</small></span><em>→</em>`;
    btn.addEventListener('click',()=>openProfile(person));
    root.appendChild(btn);
  });
}

wuHotspot.addEventListener('click',()=>correspondents[0] && openProfile(correspondents[0]));
document.querySelectorAll('[data-close-drawer]').forEach(el=>el.addEventListener('click',closeProfile));
document.querySelectorAll('[data-close-directory]').forEach(el=>el.addEventListener('click',closeDirectory));
document.getElementById('openDirectory').addEventListener('click',openDirectory);

document.addEventListener('keydown',e=>{ if(e.key==='Escape'){ closeProfile(); closeDirectory(); }});

document.querySelectorAll('.filter').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('.filter').forEach(x=>x.classList.remove('active'));
  btn.classList.add('active');
  const region=btn.dataset.region;
  const active = region==='all' || region==='asia';
  wuHotspot.style.opacity = active ? '1' : '.18';
  wuHotspot.style.pointerEvents = active ? 'auto' : 'none';
}));

document.getElementById('searchInput').addEventListener('input',e=>{
  const q=e.target.value.trim().toLowerCase();
  const p=correspondents[0];
  if(!q || !p){ mapStage.classList.remove('search-dim'); wuHotspot.classList.remove('is-match'); return; }
  const hay=[p.name_zh,p.name_en,p.country_zh,p.country_en,p.organization_zh,p.organization_en,p.heritage.name_zh,p.heritage.name_en].join(' ').toLowerCase();
  const match=hay.includes(q);
  mapStage.classList.toggle('search-dim',!match);
  wuHotspot.classList.toggle('is-match',match);
});

loadData().catch(err=>{
  console.error(err);
  document.querySelector('.map-note span').textContent='資料載入失敗，請確認透過 GitHub Pages 或網頁伺服器開啟。';
});
