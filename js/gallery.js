import { ModalModule } from './modal.js';

export const GalleryModule = {
  init(containerId, totalImages = 76) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let images = Array.from({ length: totalImages }, (_, i) => String(i + 1).padStart(2, '0'));
    images = images.sort(() => Math.random() - 0.5);

    const bigIndices = [];
    const usedSpaces = new Set();

    while(bigIndices.length < 7) {
      const rand = Math.floor(Math.random() * (totalImages - 10));
      if (rand % 3 < 2) {
        const spots = [rand, rand + 1, rand + 3, rand + 4];
        if (!spots.some(s => usedSpaces.has(s))) {
          bigIndices.push(rand);
          spots.forEach(s => usedSpaces.add(s));
        }
      }
    }

    container.innerHTML = images.map((num, idx) => {
      if (usedSpaces.has(idx) && !bigIndices.includes(idx)) return '';
      const isBig = bigIndices.includes(idx);
      return `
        <div class="grid-item ${isBig ? 'big' : ''}">
          <img src="img/${num}.jpg" 
               onerror="this.style.display='none'; this.parentElement.style.background='#eee';" 
               onclick="window.openModal('img/${num}.jpg')">
        </div>
      `;
    }).join('');

    window.openModal = (src) => ModalModule.open(src);
    ModalModule.setImageList(images.map(num => `img/${num}.jpg`));
  }
};
