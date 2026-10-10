'use strict';

const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
function closeMenu() {
  mobileNav.hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  mobileNav.hidden = !open;
  menuButton.setAttribute('aria-expanded', String(open));
});
mobileNav.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !mobileNav.hidden) {
    closeMenu();
    menuButton.focus();
  }
});
matchMedia('(min-width: 761px)').addEventListener('change', event => {
  if (event.matches) closeMenu();
});

const collectionData = {
  cortinas: {
    image: '12-cortinas-brancas-sala.jpg', alt: 'Cortinas brancas filtrando a luz na sala',
    title: 'Texturas que\nacolhem.',
    description: 'Tecidos, pregas e acabamentos escolhidos para acompanhar a arquitetura. Da transparência delicada a composições com mais privacidade, tudo começa no seu ambiente.',
    note: 'Caimento sob medida. Atenção a cada acabamento.',
    caption: 'O movimento do tecido, a suavidade da luz.'
  },
  persianas: {
    image: '13-double-vision-sala.jpg', alt: 'Persiana double vision clara em uma sala com sofá cinza',
    title: 'Precisão em\ncada linha.',
    description: 'Rolô, romana, horizontal ou double vision. Diferentes formas de filtrar a luz e escolher a privacidade, com materiais e proporções pensados para o seu ambiente.',
    note: 'Uma escolha para cada janela e cada rotina.',
    caption: 'Linhas que organizam a luz e o espaço.'
  },
  automacao: {
    image: '10-cortinas-pe-direito-alto-escada.jpg', alt: 'Cortina alta junto à escada, exemplo de um vão que pode receber automação',
    title: 'Conforto em\num gesto.',
    description: 'Abra, feche e ajuste a entrada de luz com praticidade. A equipe avalia o sistema adequado ao modelo e ao tamanho do seu vão, inclusive em espaços de pé-direito duplo.',
    note: 'Consulte os modelos e as possibilidades de integração.',
    caption: 'Grandes alturas, novas possibilidades de controle.'
  }
};
const collectionTabs = [...document.querySelectorAll('[data-collection]')];
function selectCollection(tab) {
  const data = collectionData[tab.dataset.collection];
  collectionTabs.forEach(item => {
    item.setAttribute('aria-selected', String(item === tab));
    item.tabIndex = item === tab ? 0 : -1;
  });
  document.querySelector('#collection-panel').setAttribute('aria-labelledby', tab.id);
  const img = document.querySelector('#collection-image');
  img.src = 'assets/images/' + data.image;
  img.alt = data.alt;
  document.querySelector('#collection-title').textContent = data.title;
  document.querySelector('#collection-description').textContent = data.description;
  document.querySelector('#collection-note').textContent = data.note;
  document.querySelector('#collection-caption').textContent = data.caption;
}
collectionTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectCollection(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % collectionTabs.length;
    if (event.key === 'ArrowLeft') next = (index + collectionTabs.length - 1) % collectionTabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = collectionTabs.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    selectCollection(collectionTabs[next]);
    collectionTabs[next].focus();
  });
});

document.querySelectorAll('[data-moment]').forEach(button => {
  button.addEventListener('click', () => {
    const after = button.dataset.moment === 'depois';
    document.querySelectorAll('[data-moment]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    const img = document.querySelector('#comparison-image');
    img.src = 'assets/images/' + (after ? 'depois' : 'antes') + '-02.webp';
    img.alt = 'Sala de jantar ' + (after ? 'depois da instalação de cortinas claras' : 'antes da instalação, com as janelas expostas');
    document.querySelector('#comparison-label').textContent = after ? 'Depois da instalação' : 'Antes da instalação';
  });
});

const galleryItems = [...document.querySelectorAll('[data-gallery]')];
const galleryDialog = document.querySelector('#gallery-dialog');
let galleryIndex = 0;
let galleryTrigger;
function renderGallery(index) {
  galleryIndex = (index + galleryItems.length) % galleryItems.length;
  const source = galleryItems[galleryIndex].querySelector('img');
  const img = document.querySelector('#gallery-image');
  img.src = source.src;
  img.alt = source.alt;
  document.querySelector('#gallery-title').textContent = galleryItems[galleryIndex].closest('article').querySelector('h3').textContent;
  document.querySelector('#gallery-count').textContent = `${galleryIndex + 1} / ${galleryItems.length}`;
}
galleryItems.forEach((button, index) => button.addEventListener('click', () => {
  galleryTrigger = button;
  renderGallery(index);
  galleryDialog.showModal();
}));
document.querySelector('.gallery-close').addEventListener('click', () => galleryDialog.close());
document.querySelector('#gallery-prev').addEventListener('click', () => renderGallery(galleryIndex - 1));
document.querySelector('#gallery-next').addEventListener('click', () => renderGallery(galleryIndex + 1));
galleryDialog.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    renderGallery(galleryIndex + (event.key === 'ArrowRight' ? 1 : -1));
  }
});
galleryDialog.addEventListener('click', event => {
  if (event.target !== galleryDialog) return;
  const box = galleryDialog.getBoundingClientRect();
  if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) galleryDialog.close();
});
galleryDialog.addEventListener('close', () => galleryTrigger?.focus());

const lightVideo = document.querySelector('#light-video');
const lightButton = document.querySelector('#start-light');
const lightSlider = document.querySelector('#light-slider');
const lightStatus = document.querySelector('#light-status');
let pendingTime = null;
let videoObjectUrl;
function seekLight() {
  if (!Number.isFinite(lightVideo.duration)) return;
  const time = Number(lightSlider.value) / 100 * Math.max(0, lightVideo.duration - .08);
  if (lightVideo.seeking) { pendingTime = time; return; }
  if (Math.abs(lightVideo.currentTime - time) > .01) lightVideo.currentTime = time;
}
lightVideo.addEventListener('seeked', () => {
  if (pendingTime !== null) {
    const time = pendingTime;
    pendingTime = null;
    if (Math.abs(lightVideo.currentTime - time) > .01) lightVideo.currentTime = time;
  }
});
lightSlider.addEventListener('input', seekLight);
function failLight() {
  lightButton.hidden = false;
  lightButton.disabled = false;
  lightButton.textContent = 'Tentar novamente';
  document.querySelector('#light-slider-wrap').hidden = true;
  lightVideo.closest('.light-stage').classList.remove('video-ready');
  lightStatus.textContent = 'O vídeo não carregou. Você pode tentar novamente ou continuar pela página.';
  pendingTime = null;
}
lightVideo.addEventListener('error', failLight);
lightVideo.addEventListener('loadeddata', () => {
  lightVideo.closest('.light-stage').classList.add('video-ready');
  lightButton.hidden = true;
  lightButton.disabled = false;
  document.querySelector('#light-slider-wrap').hidden = false;
  lightStatus.textContent = 'Deslize para explorar. Use também as setas do teclado.';
  seekLight();
  lightSlider.focus({preventScroll:true});
});
lightButton.addEventListener('click', async () => {
  lightButton.disabled = true;
  lightStatus.textContent = 'Preparando a experiência…';
  if (videoObjectUrl) URL.revokeObjectURL(videoObjectUrl);
  try {
    // Direct source permits the downloaded proposal to work when opened as a file.
    if (location.protocol === 'file:') lightVideo.src = 'assets/video/automacao-real.mp4';
    else {
      const response = await fetch('assets/video/automacao-real.mp4', {signal:AbortSignal.timeout(20000)});
      if (!response.ok) throw new Error('Video unavailable');
      videoObjectUrl = URL.createObjectURL(await response.blob());
      lightVideo.src = videoObjectUrl;
    }
    lightVideo.load();
  } catch { failLight(); }
});
document.querySelector('#year').textContent = new Date().getFullYear();
