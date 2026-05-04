import { GalleryModule } from './gallery.js';
import { ModalModule } from './modal.js';
import { CommentsModule } from './comments.js';

const app = {
  async init() {
    try {
      GalleryModule.init('gallery-container', 76);
      ModalModule.init();
      await CommentsModule.init('comment-list');
    } catch (e) {
      console.error("초기화 실패:", e);
    }
  },
  
  async handleCommentSubmit() {
    const contentEl = document.getElementById('comment-input');
    const passwordEl = document.getElementById('pw-input');
    const errorMsg = document.getElementById('error-message');
    const btn = document.getElementById('submit-btn');

    const content = contentEl.value.trim();
    const password = passwordEl.value.trim();

    if (!content || password.length < 4) {
        errorMsg.textContent = "내용과 비밀번호(4자 이상)를 확인해주세요.";
        errorMsg.style.display = "block";
        return;
    }

    btn.disabled = true;
    btn.innerText = "등록 중...";

    try {
        await fetch(CommentsModule.config.apiUrl, {
          method: 'POST',
          body: JSON.stringify({ 
            action: 'create', 
            content: content, 
            password: password 
          })
        });

        contentEl.value = '';
        passwordEl.value = '';
        errorMsg.style.color = "blue";
        errorMsg.textContent = "기도가 등록되었습니다.";
        errorMsg.style.display = "block";
        
        setTimeout(() => {
            errorMsg.style.display = "none";
            errorMsg.style.color = "#e74c3c";
            CommentsModule.render(1); 
        }, 1000);
    } catch (e) {
        errorMsg.textContent = "네트워크 오류가 발생했습니다.";
        errorMsg.style.display = "block";
    } finally {
        btn.disabled = false;
        btn.innerText = "등록";
    }
  }
};

// 전역 함수 연결
window.submitComment = () => app.handleCommentSubmit();
document.addEventListener('DOMContentLoaded', () => app.init());
