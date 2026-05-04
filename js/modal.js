export const ModalModule = {
  init() {
    this.modal = document.getElementById('image-modal');
    this.modalImg = document.getElementById('modal-img');
    this.zoomElement = document.querySelector('.zoom-container');
    this.closeBtn = document.querySelector('.close-btn');
    this.pz = null;

    // 닫기 버튼 클릭
    if (this.closeBtn) {
      this.closeBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.close();
      };
    }

    // 배경 클릭 시 닫기
    if (this.modal) {
      this.modal.onclick = (e) => {
        if (e.target === this.modal || e.target === this.zoomElement) {
          this.close();
        }
      };
    }
  },

  open(src) {
    if (!this.modal || !this.modalImg) return;

    this.modal.style.display = 'block'; // 먼저 보이게 설정
    this.modalImg.src = src;
    document.body.style.overflow = 'hidden';

    // ❗ 핵심: 이미지가 로드된 후 핀치줌 초기화
    this.modalImg.onload = () => {
      const TargetLib = window.PinchZoom;
      if (typeof TargetLib !== 'undefined') {
        // 기존 인스턴스가 있으면 파괴하거나 새로 생성
        if (this.pz) {
          this.pz.destroy(); // 이전 상태 제거
        }
        
        // 새로운 줌 인스턴스 생성
        this.pz = new TargetLib(this.zoomElement, {
          draggableUnzoomed: false,
          minZoom: 1,
          maxZoom: 4,
          tapZoomFactor: 2,
          useHorizontalScrolling: false
        });
      }
    };
  },

  close() {
    if (this.modal) {
      this.modal.style.display = 'none';
      document.body.style.overflow = 'auto';
      // 닫을 때 줌 인스턴스 파괴 (메모리 관리 및 리셋)
      if (this.pz) {
        this.pz.destroy();
        this.pz = null;
      }
    }
  }
};
