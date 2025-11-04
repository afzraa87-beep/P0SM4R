// Animasi scroll muncul lembut
const items = document.querySelectorAll('.plan-item');

const showOnScroll = () => {
  const triggerBottom = window.innerHeight * 0.85;
  items.forEach(item => {
    const itemTop = item.getBoundingClientRect().top;
    if (itemTop < triggerBottom) {
      item.classList.add('show');
    }
  });
};

window.addEventListener('scroll', showOnScroll);
showOnScroll(); // panggil pertama kali

// Tombol Tambah Kegiatan (sementara alert)
const buttons = document.querySelectorAll('.add-btn');
buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    alert('Fitur tambah kegiatan segera hadir! 🚀');
  });
});
