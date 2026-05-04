import { GalleryModule } from './gallery.js';
import { ModalModule } from './modal.js';
import { CommentsModule } from './comments.js';

const app = {
  // 1. 초기화 설정 (여기서 갤러리를 다시 살려냅니다)
  async init() {
    // 갤러리 이미지 로드 (76장) - 이 부분이 누락되었을 겁니다.
    GalleryModule.init('gallery-container', 76);

    // 댓글 리스트 로드
    try {
      await CommentsModule.init('comment-list');
    } catch (e) {
      console.error("댓글 로딩 실패:", e);
    }

    // 모달 기능 활성화
    try {
      ModalModule.init();
    } catch (e) {
      console.error("모달 초기화 실패:", e);
    }
  },

  // 2. 댓글 등록 로직
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
    if (password.length < 4) {
      errorMsg.textContent = "비밀번호를 4자 이상 입력해주세요.";
      passwordEl.focus();
      return;
    }

    btn.disabled = true;
    btn.innerText = "등록 중...";

    try {
      const result = await CommentsModule.postComment(content, password);
      if (result.status === 200) {
        contentEl.value = '';
        passwordEl.value = '';
        alert("댓글이 등록되었습니다.");
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

// 전역 함수 연결 및 초기화 실행
window.submitComment = () => app.handleCommentSubmit();
document.addEventListener('DOMContentLoaded', () => app.init());
