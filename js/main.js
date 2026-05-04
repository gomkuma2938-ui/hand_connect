import { GalleryModule } from './gallery.js';
import { ModalModule } from './modal.js';
import { CommentsModule } from './comments.js';

const app = {
  // 1. 초기화 설정
  async init() {
    // 갤러리 이미지 로드
    GalleryModule.init('gallery-container', 76);

    // 댓글 리스트 로드 (모달 에러가 나도 실행되도록 try-catch 처리)
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

  // 2. 댓글 등록 로직 (app 객체 안으로 통합)
  async handleCommentSubmit() {
    const contentEl = document.getElementById('comment-input');
    const passwordEl = document.getElementById('pw-input');
    const errorMsg = document.getElementById('error-message');
    const btn = document.getElementById('submit-btn');

    if (!contentEl || !passwordEl) return;

    const content = contentEl.value.trim();
    const password = passwordEl.value.trim();

    // 유효성 검사
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

    // 상태 변경
    btn.disabled = true;
    btn.innerText = "등록 중...";
    errorMsg.textContent = "";

    try {
      const result = await CommentsModule.postComment(content, password);
      
      if (result.status === 200) {
        contentEl.value = '';
        passwordEl.value = '';
        alert("댓글이 등록되었습니다.");
        // 등록 성공 후 목록 즉시 갱신
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

// 3. 전역 함수 연결 및 초기화 실행
window.submitComment = () => app.handleCommentSubmit();
document.addEventListener('DOMContentLoaded', () => app.init());
