// ❗ 1. ModalModule을 반드시 import 해야 에러가 안 납니다.
import { ModalModule } from './modal.js';

export const GalleryModule = {
  init(containerId, totalImages = 76) {
    const container = document.getElementById(containerId);
    if (!container) return; // 컨테이너 없으면 중단

    let images = Array.from({ length: totalImages }, (_, i) => 
      String(i + 1).padStart(2, '0')
    );
    
    // 1. 셔플
    images = images.sort(() => Math.random() - 0.5);

    // 2. 2x2 인덱스 선정 (겹침 방지 로직)
    const bigIndices = [];
    const usedSpaces = new Set();

    while(bigIndices.length < 7) {
      const rand = Math.floor(Math.random() * (totalImages - 10));
      const col = rand % 3;

      if (col < 2) {
        const conflict = [0, 1, 3, 4].some(offset => usedSpaces.has(rand + offset));
        if (!conflict) {
          bigIndices.push(rand);
          [0, 1, 3, 4].forEach(offset => usedSpaces.add(rand + offset));
        }
      }
    }

    // 3. 렌더링 (Lazy Load를 일단 풀어서 회색 박스라도 보이게 수정)
    container.innerHTML = images.map((num, idx) => {
      if (usedSpaces.has(idx) && !bigIndices.includes(idx)) return '';

      const isBig = bigIndices.includes(idx);
      // ❗ 이미지가 없어도 영역을 차지하도록 src에 바로 경로를 넣거나 더미를 넣음
      return `
        <div class="grid-item ${isBig ? 'big' : ''}">
          <img src="img/${num}.jpg" 
               onerror="this.style.display='none'; this.parentElement.style.background='#eee';" 
               alt="기도 이미지" 
               onclick="window.openModal('img/${num}.jpg')">
        </div>
      `;
    }).join('');

    // 전역에서 모달을 열 수 있게 연결
    window.openModal = (src) => ModalModule.open(src);
  }
};
