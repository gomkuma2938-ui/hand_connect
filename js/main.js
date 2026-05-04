import { GalleryModule } from './gallery.js';
import { ModalModule } from './modal.js';
import { CommentsModule } from './comments.js';

const app = {
  async init() {
    // 갤러리 초기화
    GalleryModule.init('gallery-container', 76);
    
    // 모달 초기화
    ModalModule.init();

    // 댓글 모듈 초기화
    await CommentsModule.init('comment-list');

    // 전역에서 접근 가능하도록 일부 바인딩 (HTML 인라인 이벤트용)
    window.submitComment = () => this.handleCommentSubmit();
  },

  async handleCommentSubmit() {
    const content = document.getElementById('comment-input').value;
    const password = document.getElementById('pw-input').value;
    const errorMsg = document.getElementById('error-message');

    if (!content || password.length < 4) {
      errorMsg.textContent = "내용과 비밀번호(4자 이상)를 확인해주세요.";
      return;
    }

    const result = await CommentsModule.postComment(content, password);
    if (result.status === 200) {
      document.getElementById('comment-input').value = '';
      document.getElementById('pw-input').value = '';
      errorMsg.textContent = "";
      await CommentsModule.render(1); // 첫 페이지로 리로드
    }
  }
};

document.addEventListener('DOMContentLoaded', () => app.init());
