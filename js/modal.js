export const ModalModule = {
  init() {
    this.modal = document.getElementById('image-modal');
    this.modalImg = document.getElementById('modal-img');
    this.zoomElement = document.querySelector('.zoom-container');
    this.closeBtn = document.querySelector('.close-btn');
    this.pz = null; // 핀치줌 인스턴스 저장용

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
    
    this.modalImg.src = src;
    this.modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // ❗ 모달이 열린 직후(화면에 보일 때) 핀치줌 초기화
    setTimeout(() => {
        const TargetLib = window.PinchZoom;
        if (this.zoomElement && typeof TargetLib !== 'undefined') {
            if (!this.pz) {
                // 처음 한 번만 생성
                this.pz = new TargetLib(this.zoomElement, {
                    draggableUnzoomed: false,
                    minZoom: 1,
                    maxZoom: 4,
                    tapZoomFactor: 2
                });
            } else {
                // 이미 있으면 위치와 크기만 업데이트
                this.pz.setZoom(1);
                this.pz.update();
            }
        }
    }, 50); // 아주 짧은 지연시간을 주어 display: flex가 반영된 후 계산하게 함
  },

  close() {
    if (this.modal) {
      this.modal.style.display = 'none';
      document.body.style.overflow = 'auto';
      // 줌 상태 초기화
      if (this.pz) {
          this.pz.setZoom(1);
          this.pz.offset = { x: 0, y: 0 };
      }
    }
  }
};
