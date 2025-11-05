/* OUR Plan's - interactive planner
   - editable cards (contenteditable)
   - add / delete
   - localStorage persistence
   - popup + toast
*/

const STORAGE_KEY = 'ourPlans_posmar_v1';

// default sample data
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

let dataPlans = JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultData;

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

function escapeHtml(str){
  if(typeof str !== 'string') return '';
  return str.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}

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
        <p class="status">
          <span class="status-text editable" contenteditable="true" data-field="status" data-idx="${idx}" data-type="${type}">${escapeHtml(plan.status)}</span>
        </p>
        <div class="actions">
          <button onclick="toggleStatus('${type}', ${idx})">🔁 Ubah Status</button>
          <button onclick="hapusPlan('${type}', ${idx})">🗑️ Hapus</button>
        </div>
      `;
      list.appendChild(card);

      // small show animation
      setTimeout(()=>card.classList.add('show'), 20);
    });

    if(dataPlans[type].length === 0){
      const hint = document.createElement('div');
      hint.className = 'plan-item';
      hint.innerHTML = `<p style="opacity:.85;margin:0">Belum ada kegiatan di bagian ini. Klik "Tambah Kegiatan" untuk menambahkan ✨</p>`;
      list.appendChild(hint);
    }
  });

  attachEditableListeners();
}

function saveData(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dataPlans));
  showToast('Tersimpan ✅');
}

function attachEditableListeners(){
  document.querySelectorAll('.editable').forEach(el => {
    el.removeEventListener('blur', onEditableBlur);
    el.addEventListener('blur', onEditableBlur);
    el.addEventListener('keydown', (e) => {
      if(e.key === 'Enter'){ e.preventDefault(); el.blur(); }
    });
  });
}

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

function toggleStatus(type, idx){
  const cur = dataPlans[type][idx].status || '';
  dataPlans[type][idx].status = cur.includes('Belum') ? 'Terlaksana ✅' : 'Belum Terlaksana ❌';
  saveData();
  renderPlans();
  showToast('Status diperbarui');
}

function hapusPlan(type, idx){
  if(!confirm('Hapus kegiatan ini?')) return;
  dataPlans[type].splice(idx,1);
  saveData();
  renderPlans();
}

// add button
addButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    currentType = btn.dataset.type;
    openPopup();
  });
});

function openPopup(){
  popup.setAttribute('aria-hidden','false');
  namaEl.value = '';
  waktuEl.value = '';
  statusEl.value = 'Belum Terlaksana ❌';
  setTimeout(()=>namaEl.focus(),120);
}

function closePopup(){
  popup.setAttribute('aria-hidden','true');
}

batalBtn.addEventListener('click', closePopup);
closeBtn.addEventListener('click', closePopup);

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

popup.addEventListener('click', (e)=>{
  if(e.target === popup) closePopup();
});

let toastTimer = null;
function showToast(text=''){
  clearTimeout(toastTimer);
  toastEl.textContent = text;
  toastEl.classList.add('show');
  toastTimer = setTimeout(()=>{ toastEl.classList.remove('show'); }, 2000);
}

// initial
renderPlans();

// small shortcut: 'n' => open new weekly
window.addEventListener('keydown', (e)=>{
  if(e.key.toLowerCase() === 'n' && !e.metaKey && !e.ctrlKey){
    currentType = 'mingguan';
    openPopup();
  }
});
