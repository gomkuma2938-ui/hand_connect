export const ModalModule = {
  init() {
    this.modal = document.getElementById('image-modal');
    this.modalImg = document.getElementById('modal-img');
    this.zoomElement = document.querySelector('.zoom-container');
    this.closeBtn = document.querySelector('.close-btn');
    this.imageList = [];
    this.currentIndex = 0;
    this.scale = 1;
    this.lastTX = 0;
    this.lastTY = 0;

    document.querySelector('.prev-btn').onclick = (e) => {
      e.stopPropagation();
      this.navigate(-1);
    };
    document.querySelector('.next-btn').onclick = (e) => {
      e.stopPropagation();
      this.navigate(1);
    };

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
    const nextIndex = (this.currentIndex + dir + this.imageList.length) % this.imageList.length;
    const nextSrc = this.imageList[nextIndex];
  
    const current = this.modalImg;
    const next = document.createElement('img');
    next.src = nextSrc;
    next.style.cssText = `
      position: absolute;
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      transform: translateX(${dir > 0 ? '100%' : '-100%'});
      transition: transform 0.3s ease;
    `;
  
    this.zoomElement.appendChild(next);
    current.style.transition = 'transform 0.3s ease';
  
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        next.style.transform = 'translateX(0)';
        current.style.transform = `translateX(${dir > 0 ? '-100%' : '100%'})`;
      });
    });
  
    setTimeout(() => {
      this.zoomElement.removeChild(current);
      next.id = 'modal-img';
      this.modalImg = next;
      this._initTouch();
      this.currentIndex = nextIndex;
      this.scale = 1;
      this.lastTX = 0;
      this.lastTY = 0;
    }, 300);
  },

  _resetTransform(img) {
    this.scale = 1;
    this.lastTX = 0;
    this.lastTY = 0;
    img.style.transform = '';
  },

  _applyTransform(img) {
    img.style.transform = `translate(${this.lastTX}px, ${this.lastTY}px) scale(${this.scale})`;
  },

  _clampPosition(img) {
    const maxX = (img.offsetWidth * (this.scale - 1)) / 2;
    const maxY = (img.offsetHeight * (this.scale - 1)) / 2;
    this.lastTX = Math.min(maxX, Math.max(-maxX, this.lastTX));
    this.lastTY = Math.min(maxY, Math.max(-maxY, this.lastTY));
  },

  _initTouch() {
    const img = this.modalImg;
    let startDist = 0;
    let startScale = 1;
    let startX = 0, startY = 0;
    let swipeStartX = 0;
    let isSwiping = false;

    img.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        isSwiping = false;
        startDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        startScale = this.scale;
      } else if (e.touches.length === 1) {
        swipeStartX = e.touches[0].clientX;
        isSwiping = true;
        if (this.scale > 1) {
          e.preventDefault();
          startX = e.touches[0].clientX - this.lastTX;
          startY = e.touches[0].clientY - this.lastTY;
        }
      }
    }, { passive: false });

    img.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (e.touches.length === 2) {
        isSwiping = false;
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        this.scale = Math.min(4, Math.max(1, startScale * (dist / startDist)));
        this._applyTransform(img);
      } else if (e.touches.length === 1 && this.scale > 1) {
        isSwiping = false;
        this.lastTX = e.touches[0].clientX - startX;
        this.lastTY = e.touches[0].clientY - startY;
        this._clampPosition(img);
        this._applyTransform(img);
      }
    }, { passive: false });

    img.addEventListener('touchend', (e) => {
      if (this.scale <= 1 && isSwiping) {
        const swipeDist = e.changedTouches[0].clientX - swipeStartX;
        if (Math.abs(swipeDist) > 50) {
          this.navigate(swipeDist < 0 ? 1 : -1);
          return;
        }
        this._resetTransform(img);
      } else {
        this._clampPosition(img);
        this._applyTransform(img);
      }
      isSwiping = false;
    });
  },

  open(src) {
    if (!this.modal || !this.modalImg) return;
    this.currentIndex = this.imageList.indexOf(src);
    this.modal.style.display = 'flex';
    this.modalImg.src = src;
    this.modalImg.style.transform = '';
    this.scale = 1;
    this.lastTX = 0;
    this.lastTY = 0;
    document.body.style.overflow = 'hidden';
  },

  close() {
    if (this.modal) {
      this.modal.style.display = 'none';
      this.modalImg.style.transform = '';
      this.scale = 1;
      this.lastTX = 0;
      this.lastTY = 0;
      document.body.style.overflow = 'auto';
    }
  }
};
