export const ModalModule = {
  init() {
    this.modal = document.getElementById('image-modal');
    this.modalImg = document.getElementById('modal-img');
    this.zoomElement = document.querySelector('.zoom-container');

    // 라이브러리 존재 여부를 안전하게 체크
    const TargetLib = window.PinchZoom; 
    
    if (this.zoomElement && typeof TargetLib === 'function') {
      try {
        new TargetLib(this.zoomElement, {
          draggableUnzoomed: false,
          minZoom: 1,
          maxZoom: 4
        });
      } catch (e) {
        console.warn("PinchZoom 초기화 건너뜀:", e);
      }
    }
  },

  open(src) {
    if (!this.modal || !this.modalImg) return;
    this.modalImg.src = src;
    this.modal.style.display = 'flex';
  },

  close() {
    if (this.modal) this.modal.style.display = 'none';
  }
};
