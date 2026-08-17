let correspondents = [];
const drawer = document.getElementById('profileDrawer');
const hotspotLayer = document.getElementById('hotspotLayer');

async function loadData(){
  const response = await fetch('data/correspondents.json');
  correspondents = await response.json();
  renderHotspots();
}

function renderHotspots(){
  hotspotLayer.innerHTML = '';
  correspondents.forEach(person => {
    if(!person?.map_hotspot) return;
    const h = person.map_hotspot;
    const btn = document.createElement('button');
    btn.className = 'hotspot';
    btn.type = 'button';
    btn.setAttribute('aria-label', `開啟${person.name_zh} ${person.name_en} 的資料`);
    btn.style.left = h.left + '%';
    btn.style.top = h.top + '%';
    btn.style.width = h.size + '%';
    btn.innerHTML = `<span class="hotspot-label"><b>${person.name_zh}</b><small>${person.name_en}</small></span>`;
    btn.addEventListener('click', () => openProfile(person));
    hotspotLayer.appendChild(btn);
  });
}

function setText(id, value){
  document.getElementById(id).textContent = value || '';
}

function openProfile(person){
  document.getElementById('profileCountry').innerHTML = `${person.country_zh} <span>${person.country_en}</span>`;
  document.getElementById('profilePhoto').src = person.photo;
  document.getElementById('profilePhoto').alt = person.name_en;
  setText('profileNameZh', person.name_zh);
  setText('profileNameEn', person.nickname ? `${person.name_en} (${person.nickname})` : person.name_en);
  setText('profileTitleZh', person.title_zh);
  setText('profileTitleEn', person.title_en);
  setText('profileOrgZh', person.organization_zh);
  setText('profileOrgEn', person.organization_en);

  const aboutSection = document.getElementById('profileBioZh').closest('.content-section');
  const hasBio = Boolean(person.bio_zh || person.bio_en);
  aboutSection.hidden = !hasBio;
  setText('profileBioZh', person.bio_zh);
  setText('profileBioEn', person.bio_en);

  const h = person.heritage;
  document.getElementById('heritageImage').src = h.image;
  document.getElementById('heritageImage').alt = h.name_en;
  setText('heritageNameZh', h.name_zh);
  setText('heritageNameEn', h.name_en);
  setText('heritageLocation', `${h.location_zh}・${h.country_zh} / ${h.location_en}, ${h.country_en}`);
  setText('heritageType', `${h.type_zh} / ${h.type_en}`);
  setText('heritageBy', `${person.name_zh} / ${person.name_en}`);
  setText('heritageDescZh', h.description_zh);
  setText('heritageDescEn', h.description_en);
  document.getElementById('heritageMapLink').href = h.google_maps;

  const credit = document.getElementById('heritageImageCredit');
  credit.hidden = !h.image_credit;
  credit.textContent = h.image_credit || '';

  const resources = document.getElementById('heritageResources');
  resources.innerHTML = '';
  const links = h.resources || [];
  resources.hidden = links.length === 0;
  links.forEach((r, idx) => {
    const a = document.createElement('a');
    a.href = r.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = `${r.label_zh || `相關連結 ${idx+1}`} ${r.label_en ? '· ' + r.label_en : ''} ↗`;
    resources.appendChild(a);
  });

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

document.querySelectorAll('[data-close-drawer]').forEach(el=>el.addEventListener('click',closeProfile));
document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeProfile(); });

loadData().catch(err=>{
  console.error(err);
  document.querySelector('.map-note span').textContent='資料載入失敗，請確認透過 GitHub Pages 或網頁伺服器開啟。';
});
