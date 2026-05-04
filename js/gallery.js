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
    const visibleImages = [];
    container.innerHTML = images.map((num, idx) => {
      if (usedSpaces.has(idx) && !bigIndices.includes(idx)) return '';
      const isBig = bigIndices.includes(idx);
      visibleImages.push(`img/${num}.jpg`);
      return `
        <div class="grid-item ${isBig ? 'big' : ''}">
          <img data-src="img/${num}.jpg"
               src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
               onerror="this.style.display='none'; this.parentElement.style.background='#eee';"
               onclick="window.openModal('img/${num}.jpg')"
               class="lazy">
        </div>
      `;
    }).join('');

    // 레이지 로딩
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          observer.unobserve(img);
        }
      });
    }, { rootMargin: '200px' });

    container.querySelectorAll('img.lazy').forEach(img => observer.observe(img));

    window.openModal = (src) => ModalModule.open(src);
    ModalModule.setImageList(visibleImages);
  }
};
