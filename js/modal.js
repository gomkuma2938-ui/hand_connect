export const ModalModule = {
  init() {
    this.modal = document.getElementById('image-modal');
    this.modalImg = document.getElementById('modal-img');
    this.zoomElement = document.querySelector('.zoom-container');
    this.closeBtn = document.querySelector('.close-btn');

    if (this.closeBtn) {
      this.closeBtn.onclick = (e) => {
        e.stopPropagation();
        this.close();
      };
    }

    // 모달 배경 클릭 시 닫기 (이미지 제외)
    if (this.modal) {
      this.modal.onclick = (e) => {
        if (e.target === this.modal || e.target === this.zoomElement) {
          this.close();
        }
      };
    }

    // ❗ 핀치줌 라이브러리 초기화
    const TargetLib = window.PinchZoom; 
    if (this.zoomElement && typeof TargetLib !== 'undefined') {
      try {
        // 이미지 컨테이너를 핀치줌 영역으로 설정
        this.pz = new TargetLib(this.zoomElement, {
          draggableUnzoomed: false,
          minZoom: 1,
          maxZoom: 4,
          onZoomStart: () => {
              // 확대 시작 시 닫기 버튼 살짝 투명하게 해서 시야 확보 (선택 사항)
              if(this.closeBtn) this.closeBtn.style.opacity = "0.3";
          },
          onZoomEnd: () => {
              if(this.closeBtn) this.closeBtn.style.opacity = "1";
          }
        });
      } catch (e) {
        console.warn("PinchZoom 초기화 실패:", e);
      }
    }
  },

  open(src) {
    if (!this.modal || !this.modalImg) return;
    
    this.modalImg.src = src;
    this.modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // 뒷배경 스크롤 방지

    // ❗ 모달 열 때마다 줌 상태 초기화
    if (this.pz) {
      this.pz.setZoom(1);
      this.pz.offset = { x: 0, y: 0 };
      this.pz.update();
    }
  },

  close() {
    if (this.modal) {
      this.modal.style.display = 'none';
      document.body.style.overflow = 'auto'; // 스크롤 복구
    }
  }
};
