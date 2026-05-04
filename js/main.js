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
        const res = await fetch(CommentsModule.config.apiUrl, {
          method: 'POST',
          body: JSON.stringify({ 
            action: 'create', // insert가 아니라 백엔드에 적힌 create여야 함
            content: content, 
            password: password 
          })
        });

        // 성공 처리
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
  
  window.submitComment = () => app.handleCommentSubmit();
  document.addEventListener('DOMContentLoaded', () => app.init());

// ❗ 6. 전역 함수는 깔끔하게 한 번만 연결
window.submitComment = () => app.handleCommentSubmit();
document.addEventListener('DOMContentLoaded', () => app.init());
