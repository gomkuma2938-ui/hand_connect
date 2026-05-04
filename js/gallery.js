export const GalleryModule = {
  init(containerId, totalImages = 76) {
    const container = document.getElementById(containerId);
    let images = Array.from({ length: totalImages }, (_, i) => 
      String(i + 1).padStart(2, '0')
    );
    
    // 1. 셔플
    images = images.sort(() => Math.random() - 0.5);

    // 2. 2x2 인덱스 선정 (랜덤 6개)
    const bigIndices = [];
    const usedSpaces = new Set(); // 이미 차지된 공간 체크

    while(bigIndices.length < 6) {
      const rand = Math.floor(Math.random() * (totalImages - 10));
      const col = rand % 3; // 0: 1열, 1: 2열, 2: 3열

      // 3열(col === 2)에서 시작하면 우측으로 넘어가므로 제외 (0 또는 1열만 가능)
      if (col < 2) {
        // 주변에 이미 2x2가 있는지 확인 (겹침 방지)
        const conflict = [0, 1, 3, 4].some(offset => usedSpaces.has(rand + offset));
        
        if (!conflict) {
          bigIndices.push(rand);
          // 2x2가 차지하는 4개의 칸을 예약
          [0, 1, 3, 4].forEach(offset => usedSpaces.add(rand + offset));
        }
      }
    }

    // 3. 렌더링
    container.innerHTML = images.map((num, idx) => {
      // 이미 사용된 칸(2x2의 오른쪽/아래쪽 칸들)은 렌더링 건너뜀
      if (usedSpaces.has(idx) && !bigIndices.includes(idx)) return '';

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
