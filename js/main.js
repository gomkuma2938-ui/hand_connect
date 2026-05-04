import { GalleryModule } from './gallery.js';
import { ModalModule } from './modal.js';
import { CommentsModule } from './comments.js';

const app = {
  async init() {
    // 1. 갤러리부터 무조건 실행
    try {
      GalleryModule.init('gallery-container', 76);
    } catch (e) { console.error("갤러리 오류:", e); }

    // 2. 댓글 로드
    try {
      await CommentsModule.init('comment-list');
    } catch (e) { console.error("댓글 로딩 실패:", e); }

    // 3. 모달 초기화
    try {
      ModalModule.init();
    } catch (e) { console.error("모달 오류:", e); }
  },

  async handleCommentSubmit() {
    const contentEl = document.getElementById('comment-input');
    const passwordEl = document.getElementById('pw-input');
    const btn = document.getElementById('submit-btn');
    const errorMsg = document.getElementById('error-message');

    if (!contentEl.value.trim()) return alert("내용을 입력하세요.");
    if (passwordEl.value.length < 4) return alert("비번은 4자 이상입니다.");

    btn.disabled = true;
    try {
      const res = await CommentsModule.postComment(contentEl.value, passwordEl.value);
      if (res.status === 200) {
        contentEl.value = '';
        passwordEl.value = '';
        alert("등록되었습니다.");
        await CommentsModule.render(1);
      }
    } catch (e) { alert("전송 실패"); }
    finally { btn.disabled = false; }
  }
};

window.submitComment = () => app.handleCommentSubmit();
document.addEventListener('DOMContentLoaded', () => app.init());
