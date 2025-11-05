/* OUR Plan's - interactive planner
   - editable cards (contenteditable)
   - add / delete
   - localStorage persistence
   - nice popup + toast
*/

const STORAGE_KEY = 'ourPlans_v1';

// default data if none
const defaultData = {
  mingguan: [
    { nama: 'Rapat OSIS', waktu: '5 November 2025', status: 'Terlaksana ✅' },
    { nama: 'Latihan Upacara', waktu: '8 November 2025', status: 'Belum Terlaksana ❌' }
  ],
  bulanan: [
    { nama: 'Bakti Sosial', waktu: 'November 2025', status: 'Belum Terlaksana ❌' }
  ],
  tahunan: [
    { nama: 'LDKS - Latihan Dasar Kepemimpinan Siswa', waktu: '2025', status: 'Terlaksana ✅' }
  ]
};

// load data
let dataPlans = JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultData;

// elements
const lists = document.querySelectorAll('.plan-list');
const addButtons = document.querySelectorAll('.add-btn');
const popup = document.getElementById('popupForm');
const namaEl = document.getElementById('namaKegiatan');
const waktuEl = document.getElementById('waktuKegiatan');
const statusEl = document.getElementById('statusKegiatan');
const simpanBtn = document.getElementById('simpanKegiatan');
const batalBtn = document.getElementById('batalPopup');
const closeBtn = document.getElementById('closePopup');
const toastEl = document.getElementById('toast');

let currentType = null;

// render function
function renderPlans(){
  lists.forEach(list => {
    const type = list.dataset.type;
    list.innerHTML = '';

    dataPlans[type].forEach((plan, idx) => {
      const card = document.createElement('article');
      card.className = `plan-item ${plan.status.includes('Belum') ? 'belum' : 'terlaksana'}`;
      card.innerHTML = `
        <h3 contenteditable="true" class="editable" data-field="nama" data-idx="${idx}" data-type="${type}">${escapeHtml(plan.nama)}</h3>
        <p contenteditable="true" class="editable" data-field="waktu" data-idx="${idx}" data-type="${type}">${escapeHtml(plan.waktu)}</p>
        <p class="status" title="Klik untuk pilih status">
          <span class="status-text" contenteditable="true" data-field="status" data-idx="${idx}" data-type="${type}">${escapeHtml(plan.status)}</span>
        </p>
        <div class="actions">
          <button onclick="toggleStatus('${type}', ${idx})">🔁 Ubah Status</button>
          <button onclick="hapusPlan('${type}', ${idx})">🗑️ Hapus</button>
        </div>
      `;
      list.appendChild(card);

      // small pop animation
      setTimeout(()=>card.classList.add('show'), 30);
    });

    // If no plans, show friendly hint
    if(dataPlans[type].length === 0){
      const hint = document.createElement('div');
      hint.className = 'plan-item';
      hint.innerHTML = `<p style="opacity:.8;margin:0">Belum ada kegiatan di bagian ini. Klik "Tambah Kegiatan" untuk menambahkan ✨</p>`;
      list.appendChild(hint);
    }
  });

  // attach editable listeners after rendering
  attachEditableListeners();
}

// escape html to prevent insertion of markup
function escapeHtml(str){
  if(typeof str !== 'string') return '';
  return str.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}

// save to localStorage
function saveData(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dataPlans));
  showToast('Tersimpan ✅');
}

// attach inline edit onblur
function attachEditableListeners(){
  document.querySelectorAll('.editable').forEach(el => {
    el.removeEventListener('blur', onEditableBlur);
    el.addEventListener('blur', onEditableBlur);
    // allow enter key to lose focus
    el.addEventListener('keydown', (e) => {
      if(e.key === 'Enter'){ e.preventDefault(); el.blur(); }
    });
  });
}

// on blur handler
function onEditableBlur(e){
  const target = e.target;
  const type = target.dataset.type;
  const idx = parseInt(target.dataset.idx, 10);
  const field = target.dataset.field;
  const value = target.innerText.trim();

  if(!type || isNaN(idx) || !field) return;

  dataPlans[type][idx][field] = value || (field === 'status' ? 'Belum Terlaksana ❌' : '—');
  saveData();
  renderPlans();
}

// toggle status helper
function toggleStatus(type, idx){
  const cur = dataPlans[type][idx].status || '';
  dataPlans[type][idx].status = cur.includes('Belum') ? 'Terlaksana ✅' : 'Belum Terlaksana ❌';
  saveData();
  renderPlans();
  showToast('Status diperbarui');
}

// delete
function hapusPlan(type, idx){
  if(!confirm('Hapus kegiatan ini?')) return;
  dataPlans[type].splice(idx,1);
  saveData();
  renderPlans();
}

// add button show popup
addButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    currentType = btn.dataset.type;
    openPopup();
  });
});

// open popup
function openPopup(){
  popup.setAttribute('aria-hidden','false');
  namaEl.value = '';
  waktuEl.value = '';
  statusEl.value = 'Belum Terlaksana ❌';
  setTimeout(()=>namaEl.focus(), 120);
}

// close popup
function closePopup(){
  popup.setAttribute('aria-hidden','true');
}

// cancel
batalBtn.addEventListener('click', closePopup);
closeBtn.addEventListener('click', closePopup);

// save from popup
simpanBtn.addEventListener('click', ()=>{
  const nama = namaEl.value.trim();
  const waktu = waktuEl.value.trim();
  const status = statusEl.value;

  if(!nama || !waktu){
    showToast('Isi nama dan waktu kegiatan dulu ya ✍️');
    return;
  }

  dataPlans[currentType].push({ nama, waktu, status });
  saveData();
  renderPlans();
  closePopup();
});

// click outside popup to close
popup.addEventListener('click', (e)=>{
  if(e.target === popup) closePopup();
});

// show toast
let toastTimer = null;
function showToast(text='') {
  clearTimeout(toastTimer);
  toastEl.textContent = text;
  toastEl.classList.add('show');
  toastTimer = setTimeout(()=>{ toastEl.classList.remove('show'); }, 2000);
}

// initial render
renderPlans();

// small keyboard shortcut: press "n" to open new weekly (fun)
window.addEventListener('keydown', (e)=>{
  if(e.key.toLowerCase() === 'n' && !e.metaKey && !e.ctrlKey){
    currentType = 'mingguan';
    openPopup();
  }
});
