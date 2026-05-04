export const GalleryModule = {
  init(containerId, totalImages = 76) {
    const container = document.getElementById(containerId);
    let images = Array.from({ length: totalImages }, (_, i) => 
      String(i + 1).padStart(2, '0')
    );
    
    // 1. 셔플
    images = images.sort(() => Math.random() - 0.5);

    // 2. 2x2 인덱스 선정 (랜덤 6개)
    // 안전장치: 3열(index % 3 === 2)에는 2x2가 올 수 없음
    const bigIndices = [];
    while(bigIndices.length < 6) {
      const rand = Math.floor(Math.random() * (totalImages - 10));
      if (rand % 3 < 2 && !bigIndices.some(idx => Math.abs(idx - rand) < 4)) {
        bigIndices.push(rand);
      }
    }

    // 3. 렌더링
    container.innerHTML = images.map((num, idx) => {
      const isBig = bigIndices.includes(idx);
      return `
        <div class="grid-item ${isBig ? 'big' : ''}">
          <img data-src="img/${num}.jpg" class="lazy" alt="기도 이미지">
        </div>
      `;
    }).join('');

    this.bindEvents();
  },

  bindEvents() {
    // Intersection Observer를 이용한 Lazy Load
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          observer.unobserve(img);
        }
      });
    });
    document.querySelectorAll('.lazy').forEach(img => observer.observe(img));
  }
};
