export const ModalModule = {
  init() {
    this.modal = document.getElementById('image-modal');
    this.modalImg = document.getElementById('modal-img');
    this.zoomElement = document.querySelector('.zoom-container');
    this.closeBtn = document.querySelector('.close-btn');
    this.pz = null;

    if (this.closeBtn) {
      this.closeBtn.onclick = (e) => {
        e.stopPropagation();
        this.close();
      };
    }

    if (this.modal) {
      this.modal.onclick = (e) => {
        // 이미지 영역 밖(배경) 클릭 시 닫기
        if (e.target === this.modal || e.target === this.zoomElement) {
          this.close();
        }
      };
    }
  },

  open(src) {
    if (!this.modal || !this.modalImg) return;
    
    // 1. 먼저 모달을 보여줌 (그래야 라이브러리가 크기 계산 가능)
    this.modal.style.display = 'flex';
    this.modalImg.src = src;
    document.body.style.overflow = 'hidden';

    // 2. 이미지가 로드된 후 핀치줌 초기화
    this.modalImg.onload = () => {
        setTimeout(() => {
            const TargetLib = window.PinchZoom || PinchZoom;
            if (typeof TargetLib !== 'undefined') {
                // 기존 인스턴스 파괴 후 재생성 (확실한 리셋)
                if (this.pz) {
                    this.pz.destroy();
                }
                this.pz = new TargetLib.default(this.zoomElement, {
                    draggableUnzoomed: false,
                    minZoom: 1,
                    maxZoom: 4,
                    onZoomStart: () => { if(this.closeBtn) this.closeBtn.style.visibility = 'hidden'; },
                    onZoomEnd: () => { if(this.closeBtn) this.closeBtn.style.visibility = 'visible'; }
                });
            }
        }, 100); // 0.1초 지연으로 렌더링 시간 확보
    };
  },

  close() {
    if (this.modal) {
      this.modal.style.display = 'none';
      document.body.style.overflow = 'auto';
      if (this.pz) {
          this.pz.destroy();
          this.pz = null;
      }
    }
  }
};
