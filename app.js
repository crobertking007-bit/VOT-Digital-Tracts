const totalPages = 32;
const image = document.getElementById('pageImage');
const currentPage = document.getElementById('currentPage');
const previousButton = document.getElementById('previousButton');
const nextButton = document.getElementById('nextButton');
const previousZone = document.getElementById('previousZone');
const nextZone = document.getElementById('nextZone');
const playButton = document.getElementById('playButton');
const slider = document.getElementById('pageSlider');

let page = Math.min(totalPages, Math.max(1, Number(location.hash.replace('#page-', '')) || 1));
let turning = false;
let autoplay = null;
let touchStartX = null;

const pageSource = number => `pages/page_${String(number).padStart(2, '0')}.jpg`;

function preload(number) {
  if (number < 1 || number > totalPages) return;
  const preloaded = new Image();
  preloaded.src = pageSource(number);
}

function render(announce = true) {
  image.src = pageSource(page);
  image.alt = `Illustrated tract page ${page} of ${totalPages}`;
  currentPage.textContent = page;
  slider.value = page;
  previousButton.disabled = page === 1;
  nextButton.disabled = page === totalPages;
  location.hash = `page-${page}`;
  preload(page - 1);
  preload(page + 1);
  if (announce) document.title = `Page ${page} of ${totalPages} — Higher Authority Court Summons`;
}

function stopAutoplay() {
  if (!autoplay) return;
  clearInterval(autoplay);
  autoplay = null;
  playButton.textContent = 'Auto play';
  playButton.setAttribute('aria-pressed', 'false');
}

function goTo(target, direction) {
  if (turning || target < 1 || target > totalPages || target === page) return;
  turning = true;
  const animationClass = direction === 'previous' ? 'turn-previous' : 'turn-next';
  image.classList.add(animationClass);
  window.setTimeout(() => {
    page = target;
    render();
  }, 235);
  window.setTimeout(() => {
    image.classList.remove(animationClass);
    turning = false;
  }, 500);
}

function previous() { goTo(page - 1, 'previous'); }
function next() {
  if (page === totalPages) { stopAutoplay(); return; }
  goTo(page + 1, 'next');
}

previousButton.addEventListener('click', previous);
nextButton.addEventListener('click', next);
previousZone.addEventListener('click', previous);
nextZone.addEventListener('click', next);

playButton.addEventListener('click', () => {
  if (autoplay) { stopAutoplay(); return; }
  if (page === totalPages) { page = 1; render(); }
  playButton.textContent = 'Pause';
  playButton.setAttribute('aria-pressed', 'true');
  autoplay = window.setInterval(next, 3200);
});

slider.addEventListener('input', event => {
  stopAutoplay();
  const target = Number(event.target.value);
  goTo(target, target < page ? 'previous' : 'next');
});

document.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'PageUp') previous();
  if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') {
    event.preventDefault();
    next();
  }
  if (event.key === 'Home') goTo(1, 'previous');
  if (event.key === 'End') goTo(totalPages, 'next');
});

document.addEventListener('touchstart', event => {
  touchStartX = event.changedTouches[0].clientX;
}, { passive: true });

document.addEventListener('touchend', event => {
  if (touchStartX === null) return;
  const distance = event.changedTouches[0].clientX - touchStartX;
  touchStartX = null;
  if (Math.abs(distance) < 45) return;
  distance > 0 ? previous() : next();
}, { passive: true });

render(false);
