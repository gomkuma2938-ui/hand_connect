// ❗ 1. 누락된 import 추가 (경로 확인 필수)
import { GalleryModule } from './gallery.js';
import { ModalModule } from './modal.js';
import { CommentsModule } from './comments.js';

const app = {
  async init() {
    // ❗ 2. 갤러리 로딩 (가장 먼저 실행되도록 분리)
    try {
      GalleryModule.init('gallery-container', 76);
    } catch (e) {
      console.error("갤러리 초기화 실패:", e);
    }

    // ❗ 3. 댓글 리스트 로드 (중복 제거 및 방어막)
    try {
      await CommentsModule.init('comment-list');
    } catch (e) {
      console.error("댓글 로딩 실패:", e);
    }

    // ❗ 4. 모달 기능 활성화
    try {
      ModalModule.init();
    } catch (e) {
      console.error("모달 초기화 실패:", e);
    }
  },

  async handleCommentSubmit() {
    const contentEl = document.getElementById('comment-input');
    const passwordEl = document.getElementById('pw-input');
    const errorMsg = document.getElementById('error-message');
    const btn = document.getElementById('submit-btn');

    if (!contentEl || !passwordEl) return;

    const content = contentEl.value.trim();
    const password = passwordEl.value.trim();

    if (!content) {
      errorMsg.textContent = "내용을 입력해주세요.";
      contentEl.focus();
      return;
    }

    btn.disabled = true;
    btn.innerText = "등록 중...";
    errorMsg.textContent = "";

    try {
      const result = await CommentsModule.postComment(content, password);

      if (result.status === 200) {
        contentEl.value = '';
        passwordEl.value = '';
        alert("댓글이 등록되었습니다.");
        // ❗ 5. 불필요한 중복 호출 제거하고 render만 실행
        await CommentsModule.render(1); 
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

// ❗ 6. 전역 함수는 깔끔하게 한 번만 연결
window.submitComment = () => app.handleCommentSubmit();
document.addEventListener('DOMContentLoaded', () => app.init());
