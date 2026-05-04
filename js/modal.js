export const ModalModule = {
  init() {
    this.modal = document.getElementById('image-modal');
    this.modalImg = document.getElementById('modal-img');
    this.closeBtn = document.querySelector('.close-btn');
    this.zoomElement = document.querySelector('.zoom-container');
    
    // 이벤트 바인딩
    this.closeBtn.onclick = () => this.close();
    this.modal.onclick = (e) => { if(e.target === this.modal) this.close(); };
    
    // 갤러리 이미지 클릭 이벤트 위임
    document.getElementById('gallery-container').addEventListener('click', (e) => {
      const img = e.target.closest('img');
      if (img) this.open(img.src);
    });

    // 핑거 줌 초기화 (PinchZoom 라이브러리 사용)
    if (window.PinchZoom) {
      new PinchZoom(this.zoomElement, {
        draggableUnzoomed: false,
        minZoom: 1,
        maxZoom: 4
      });
    }
  },

  open(src) {
    this.modalImg.src = src;
    this.modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // 스크롤 방지
  },

  close() {
    this.modal.style.display = 'none';
    this.modalImg.src = '';
    document.body.style.overflow = '';
  }
};
