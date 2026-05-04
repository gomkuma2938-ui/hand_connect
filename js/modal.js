export const ModalModule = {
  init() {
    this.modal = document.getElementById('image-modal');
    this.modalImg = document.getElementById('modal-img');
    this.zoomElement = document.querySelector('.zoom-container');
    this.closeBtn = document.querySelector('.close-btn');
    this.imageList = [];
    this.currentIndex = 0;
    
    document.querySelector('.prev-btn').onclick = (e) => {
      e.stopPropagation();
      this.navigate(-1);
    };
    document.querySelector('.next-btn').onclick = (e) => {
      e.stopPropagation();
      this.navigate(1);
    };

    this.scale = 1;

    if (this.closeBtn) {
      this.closeBtn.onclick = (e) => {
        e.stopPropagation();
        this.close();
      };
    }
    if (this.modal) {
      this.modal.onclick = (e) => {
        if (e.target === this.modal) this.close();
      };
    }
    this._initTouch();
  },

  setImageList(list) {
    this.imageList = list;
  },

  navigate(dir) {
    this.currentIndex = (this.currentIndex + dir + this.imageList.length) % this.imageList.length;
    this.modalImg.src = this.imageList[this.currentIndex];
    this.modalImg.style.transform = '';
    this.scale = 1;
  },

  _initTouch() {
    const img = this.modalImg;
    let startDist = 0;
    let startScale = 1;
    let startX = 0, startY = 0;
    let lastTX = 0, lastTY = 0;

    img.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        startDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        startScale = this.scale;
      } else if (e.touches.length === 1 && this.scale > 1) {
        e.preventDefault();
        startX = e.touches[0].clientX - lastTX;
        startY = e.touches[0].clientY - lastTY;
      }
    }, { passive: false });

    img.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        this.scale = Math.min(4, Math.max(1, startScale * (dist / startDist)));
        img.style.transform = `translate(${lastTX}px, ${lastTY}px) scale(${this.scale})`;
      } else if (e.touches.length === 1 && this.scale > 1) {
        e.preventDefault();
        lastTX = e.touches[0].clientX - startX;
        lastTY = e.touches[0].clientY - startY;

        const maxX = (img.offsetWidth * (this.scale - 1)) / 2;
        const maxY = (img.offsetHeight * (this.scale - 1)) / 2;
        lastTX = Math.min(maxX, Math.max(-maxX, lastTX));
        lastTY = Math.min(maxY, Math.max(-maxY, lastTY));

        img.style.transform = `translate(${lastTX}px, ${lastTY}px) scale(${this.scale})`;
      }
    }, { passive: false });

    img.addEventListener('touchend', () => {
      if (this.scale <= 1) {
        this.scale = 1;
        lastTX = 0;
        lastTY = 0;
        img.style.transform = '';
      } else {
        const maxX = (img.offsetWidth * (this.scale - 1)) / 2;
        const maxY = (img.offsetHeight * (this.scale - 1)) / 2;
        lastTX = Math.min(maxX, Math.max(-maxX, lastTX));
        lastTY = Math.min(maxY, Math.max(-maxY, lastTY));
        img.style.transform = `translate(${lastTX}px, ${lastTY}px) scale(${this.scale})`;
      }
    });
  },

  open(src) {
    if (!this.modal || !this.modalImg) return;
    this.currentIndex = this.imageList.indexOf(src);
    this.modal.style.display = 'flex';
    this.modalImg.src = src;
    this.modalImg.style.transform = '';
    this.scale = 1;
    document.body.style.overflow = 'hidden';
  },

  close() {
    if (this.modal) {
      this.modal.style.display = 'none';
      this.modalImg.style.transform = '';
      this.scale = 1;
      document.body.style.overflow = 'auto';
    }
  }
};
