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

document.addEventListener('DOMContentLoaded', () => app.init());

// HTML의 onclick에서 찾을 수 있도록 window 객체에 직접 할당
window.submitComment = () => {
  // main.js 내부의 app 객체에 접근하여 실행
  const content = document.getElementById('comment-input').value;
  const password = document.getElementById('pw-input').value;
  const errorMsg = document.getElementById('error-message');

  if (!content || password.length < 4) {
    errorMsg.textContent = "내용과 비밀번호(4자 이상)를 확인해주세요.";
    return;
  }
  
  // CommentsModule은 이미 상단에서 import 되어 있어야 합니다.
  import('./comments.js').then(m => {
    m.CommentsModule.postComment(content, password).then(result => {
        if (result.status === 200) {
            location.reload(); // 성공 시 새로고침하여 댓글 확인
        }
    });
  });
};
