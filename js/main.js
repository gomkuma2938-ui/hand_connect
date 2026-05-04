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
  
      // 1. 에러 초기화 및 가시화
      errorMsg.style.display = "none";
      errorMsg.textContent = "";
  
      if (!content) {
        errorMsg.textContent = "내용을 입력해주세요.";
        errorMsg.style.display = "block";
        contentEl.focus();
        return;
      }
      
      if (password.length < 4) {
        errorMsg.textContent = "비밀번호를 4자 이상 입력해주세요.";
        errorMsg.style.display = "block";
        passwordEl.focus();
        return;
      }
  
      btn.disabled = true;
      btn.innerText = "중..."; // 버튼 높이 유지를 위해 텍스트 최소화
      
      try {
        // 2. postComment가 모듈 내에 없다면 fetch 로직 직접 수행 또는 추가 필요
        const res = await fetch(CommentsModule.config.apiUrl, {
          method: 'POST',
          body: JSON.stringify({ action: 'insert', content, password })
        });
        const result = await res.json();
  
        if (result.status === 200) {
          contentEl.value = '';
          passwordEl.value = '';
          // 3. alert 제거: 성공 시 에러 메시지 칸에 "등록되었습니다" 잠시 표시하거나 그냥 렌더링
          errorMsg.style.color = "blue"; // 성공은 파란색으로 잠깐 표시 가능
          errorMsg.textContent = "성공적으로 등록되었습니다.";
          errorMsg.style.display = "block";
          
          setTimeout(() => {
              errorMsg.style.display = "none";
              errorMsg.style.color = "red"; // 다시 에러 색상으로 복구
          }, 2000);
  
          await CommentsModule.render(1); 
        } else {
          errorMsg.textContent = "등록 실패: " + (result.message || "서버 오류");
          errorMsg.style.display = "block";
        }
      } catch (e) {
        console.error(e);
        errorMsg.textContent = "네트워크 연결을 확인해주세요.";
        errorMsg.style.display = "block";
      } finally {
        btn.disabled = false;
        btn.innerText = "등록";
      }
    }
  };
  
  window.submitComment = () => app.handleCommentSubmit();
  document.addEventListener('DOMContentLoaded', () => app.init());

// ❗ 6. 전역 함수는 깔끔하게 한 번만 연결
window.submitComment = () => app.handleCommentSubmit();
document.addEventListener('DOMContentLoaded', () => app.init());
