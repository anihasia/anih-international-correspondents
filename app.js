let correspondents = [];
const drawer = document.getElementById('profileDrawer');
const hotspotLayer = document.getElementById('hotspotLayer');
const mapImage = document.querySelector('#mapStage > img');

async function loadData(){
  const response = await fetch('data/correspondents.json');
  correspondents = await response.json();
  syncHotspotLayer();
  renderHotspots();
  requestAnimationFrame(syncHotspotLayer);
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
    btn.innerHTML = `<span class="hotspot-label"><b>查看介紹</b><small>View profile</small></span>`;
    btn.addEventListener('click', () => openProfile(person));
    hotspotLayer.appendChild(btn);
  });
}


function syncHotspotLayer(){
  if(!mapImage || !hotspotLayer) return;

  // Match the hotspot layer to the map image itself, including the wide
  // scrollable mobile layout. Using offsetWidth/offsetHeight keeps the
  // coordinate system aligned with the actual image pixels.
  hotspotLayer.style.left = mapImage.offsetLeft + 'px';
  hotspotLayer.style.top = mapImage.offsetTop + 'px';
  hotspotLayer.style.width = mapImage.offsetWidth + 'px';
  hotspotLayer.style.height = mapImage.offsetHeight + 'px';
}

if(mapImage){
  if(mapImage.complete) syncHotspotLayer();
  mapImage.addEventListener('load', syncHotspotLayer);
}
window.addEventListener('resize', syncHotspotLayer);

function setText(id, value){
  document.getElementById(id).textContent = value || '';
}

function openProfile(person){
  document.getElementById('profileCountry').innerHTML = `${person.country_zh} <span>${person.country_en}</span>`;
  const profilePhoto = document.getElementById('profilePhoto');
  profilePhoto.src = person.photo;
  profilePhoto.alt = person.name_en;
  // Keep all uploaded portraits in the same circular frame.
  // photo_position can be adjusted per person in correspondents.json, e.g. "center 30%".
  profilePhoto.style.objectPosition = person.photo_position || 'center center';
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
    a.rel = 'noopener noreferrer';
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
});

/* =========================================================
   EXTERNAL LINKS — SINGLE OPEN
   Each real user click/tap opens an external URL only once.
   No synthetic fallback click is used.
   ========================================================= */
document.addEventListener('click', function(event){
  const link = event.target.closest('a[href]');
  if(!link) return;

  let url;
  try {
    url = new URL(link.href, window.location.href);
  } catch (err) {
    return;
  }

  const isHttp = url.protocol === 'http:' || url.protocol === 'https:';
  const isExternal = isHttp && url.origin !== window.location.origin;
  if(!isExternal) return;

  // Keep normal desktop modifier/middle-click behavior.
  if(
    event.button > 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) return;

  event.preventDefault();
  event.stopPropagation();

  const opened = window.open(url.href, '_blank', 'noopener,noreferrer');
  if(opened){
    try { opened.opener = null; } catch (err) {}
  }
}, false);
