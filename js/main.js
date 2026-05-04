import { GalleryModule } from './gallery.js';
import { ModalModule } from './modal.js';
import { CommentsModule } from './comments.js';

const app = {
  async init() {
    // 1. 각 모듈 초기화
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

    // 2. 유효성 검사 (입력값이 없을 때 반응)
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

    // 3. 등록 프로세스 시작 (버튼 잠금)
    btn.disabled = true;
    btn.innerText = "등록 중...";
    errorMsg.textContent = "";

    try {
      const result = await CommentsModule.postComment(content, password);
      if (result.status === 200) {
        alert("댓글이 안온하게 등록되었습니다.");
        contentEl.value = '';
        passwordEl.value = '';
        await CommentsModule.render(1); // 1페이지 목록 새로고침
      } else {
        errorMsg.textContent = "서버 연결 오류가 발생했습니다.";
      }
    } catch (e) {
      console.error(e);
      errorMsg.textContent = "네트워크 상태를 확인해주세요.";
    } finally {
      btn.disabled = false;
      btn.innerText = "등록";
    }
  }
};

// ❗ HTML의 onclick에서 찾을 수 있도록 window 객체에 수동으로 연결
window.submitComment = () => {
  app.handleCommentSubmit();
};

// 페이지 로드 시 앱 실행
document.addEventListener('DOMContentLoaded', () => app.init());
