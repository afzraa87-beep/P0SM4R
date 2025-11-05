const popup = document.getElementById('popupForm');
const addButtons = document.querySelectorAll('.add-btn');
const simpanBtn = document.getElementById('simpanKegiatan');
const batalBtn = document.getElementById('batalPopup');

let currentType = null;

// Ambil data dari localStorage
let dataPlans = JSON.parse(localStorage.getItem('ourPlans')) || {
  mingguan: [],
  bulanan: [],
  tahunan: []
};

// Render awal
function renderPlans() {
  document.querySelectorAll('.plan-list').forEach(list => {
    const type = list.dataset.type;
    list.innerHTML = '';
    dataPlans[type].forEach((plan, index) => {
      const div = document.createElement('div');
      div.className = `plan-item ${plan.status.includes('Belum') ? 'belum' : 'terlaksana'}`;
      div.innerHTML = `
        <h3 contenteditable="true" onblur="editPlan('${type}', ${index}, 'nama', this.innerText)">${plan.nama}</h3>
        <p contenteditable="true" onblur="editPlan('${type}', ${index}, 'waktu', this.innerText)">${plan.waktu}</p>
        <p class="status" contenteditable="true" onblur="editPlan('${type}', ${index}, 'status', this.innerText)">${plan.status}</p>
        <div class="actions">
          <button onclick="hapusPlan('${type}', ${index})">🗑️ Hapus</button>
        </div>
      `;
      list.appendChild(div);
    });
  });
}

renderPlans();

// Tombol tambah
addButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    currentType = btn.dataset.type;
    popup.style.display = 'flex';
  });
});

batalBtn.addEventListener('click', () => {
  popup.style.display = 'none';
});

simpanBtn.addEventListener('click', () => {
  const nama = document.getElementById('namaKegiatan').value.trim();
  const waktu = document.getElementById('waktuKegiatan').value.trim();
  const status = document.getElementById('statusKegiatan').value;
  if (nama && waktu) {
    dataPlans[currentType].push({ nama, waktu, status });
    localStorage.setItem('ourPlans', JSON.stringify(dataPlans));
    renderPlans();
    popup.style.display = 'none';
    document.getElementById('namaKegiatan').value = '';
    document.getElementById('waktuKegiatan').value = '';
  }
});

// Edit plan (langsung di web)
function editPlan(type, index, field, value) {
  dataPlans[type][index][field] = value;
  localStorage.setItem('ourPlans', JSON.stringify(dataPlans));
  renderPlans();
}

// Hapus plan
function hapusPlan(type, index) {
  dataPlans[type].splice(index, 1);
  localStorage.setItem('ourPlans', JSON.stringify(dataPlans));
  renderPlans();
}
