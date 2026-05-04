import { GalleryModule } from './gallery.js';
import { ModalModule } from './modal.js';
import { CommentsModule } from './comments.js';

const app = {
  async init() {
    GalleryModule.init('gallery-container', 76);
    ModalModule.init();
    await CommentsModule.init('comment-list');
  },

  async handleCommentSubmit() {
    const contentEl = document.getElementById('comment-input');
    const passwordEl = document.getElementById('pw-input');
    const errorMsg = document.getElementById('error-message');
    const btn = document.getElementById('submit-btn');

    const content = contentEl.value.trim();
    const password = passwordEl.value.trim();

    if (!content) {
      errorMsg.textContent = "내용을 입력해주세요.";
      contentEl.focus();
      return;
    }
    if (password.length < 4) {
      errorMsg.textContent = "비밀번호를 4자 이상 입력해주세요.";
      passwordEl.focus();
      return;
    }

    btn.disabled = true;
    btn.innerText = "등록 중...";
    errorMsg.textContent = "";

    try {
      // 1. 시트에 데이터 전송
      const result = await CommentsModule.postComment(content, password);
      
      if (result.status === 200) {
        // 2. 입력창 비우기
        contentEl.value = '';
        passwordEl.value = '';
        errorMsg.textContent = "";
        
        // 3. ❗ 중요: 등록 성공 후 목록을 즉시 다시 불러오기
        alert("댓글이 등록되었습니다.");
        await CommentsModule.init('comment-list'); 
      } else {
        errorMsg.textContent = "등록 실패 (서버 응답 오류)";
      }
    } catch (e) {
      console.error(e);
      errorMsg.textContent = "네트워크 연결을 확인해주세요.";
    } finally {
      btn.disabled = false;
      btn.innerText = "등록";
    }
  }
};

window.submitComment = () => {
  app.handleCommentSubmit();
};

document.addEventListener('DOMContentLoaded', () => app.init());
