export const ModalModule = {
  init() {
    this.modal = document.getElementById('image-modal');
    this.modalImg = document.getElementById('modal-img');
    this.closeBtn = document.querySelector('.close-btn');
    this.zoomElement = document.querySelector('.zoom-container');
    this.pz = null; // 핑거줌 인스턴스 저장용
    
    // 이벤트 바인딩
    this.closeBtn.onclick = () => this.close();
    this.modal.onclick = (e) => { if(e.target === this.modal) this.close(); };
    
    // 갤러리 이미지 클릭 이벤트 위임
    document.getElementById('gallery-container').addEventListener('click', (e) => {
      const img = e.target.closest('img');
      if (img) this.open(img.src);
    });

    // 핑거 줌 초기화
    const PinchZoomLib = window.PinchZoom || window.default?.PinchZoom;
    if (PinchZoomLib && this.zoomElement) {
      this.pz = new PinchZoomLib(this.zoomElement, {
        draggableUnzoomed: false,
        minZoom: 1,
        maxZoom: 4
      });
    } else {
      console.warn("PinchZoom 라이브러리를 로드하지 못했습니다.");
    }
  }, // <--- 이 중괄호가 빠져있었습니다!

  open(src) {
    this.modalImg.src = src;
    this.modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // 스크롤 방지
    
    // 이미지를 열 때마다 줌 상태를 1배율로 초기화 (이전 줌 기록 방지)
    if (this.pz) this.pz.setZoom(1);
  },

  close() {
    this.modal.style.display = 'none';
    this.modalImg.src = '';
    document.body.style.overflow = '';
  }
};
