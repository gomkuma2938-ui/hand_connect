export const ModalModule = {
  init() {
    this.modal = document.getElementById('image-modal');
    this.modalImg = document.getElementById('modal-img');
    this.zoomElement = document.querySelector('.zoom-container');
    this.closeBtn = document.querySelector('.close-btn');

    if (this.closeBtn) this.closeBtn.onclick = () => this.close();
    if (this.modal) this.modal.onclick = (e) => { if(e.target === this.modal) this.close(); };

    const TargetLib = window.PinchZoom; 
    if (this.zoomElement && typeof TargetLib === 'function') {
      try { new TargetLib(this.zoomElement, { draggableUnzoomed: false, minZoom: 1, maxZoom: 4 }); } catch (e) {}
    }
  },
  open(src) {
    if (!this.modal || !this.modalImg) return;
    this.modalImg.src = src;
    this.modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  },
  close() {
    if (this.modal) {
        this.modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
  }
};
