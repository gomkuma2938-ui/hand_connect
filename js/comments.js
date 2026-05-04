export const CommentsModule = {
  config: {
    // 1. 새로 바뀐 주소 적용 완료
    apiUrl: 'https://script.google.com/macros/s/AKfycbyVKORhy8YN5vaWf6xIrikRjYwhodtfEQDdkpXvPALD-GIfXlW-kqOr81H_gvRfvXhg6g/exec', 
    pageSize: 10,
    pageGroupSize: 5
  },
  cache: {},

  async init(containerId) {
    this.listContainer = document.getElementById(containerId);
    this.pageContainer = document.getElementById('pagination');
    if (!this.listContainer) return;
    await this.render(1);
  },

  async render(page = 1) {
    if (this.cache[page]) {
      this.displayComments(this.cache[page].data);
      this.renderPagination(this.cache[page].total, page);
      return;
    }

    try {
      this.listContainer.innerHTML = '<div class="spinner-container"><div class="spinner"></div></div>';
      
      const response = await fetch(`${this.config.apiUrl}?page=${page}&pageSize=${this.config.pageSize}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const result = await response.json(); 
      
      this.cache[page] = result;
      this.displayComments(result.data);
      this.renderPagination(result.total, page);
    } catch (e) {
      console.error("데이터 로드 실패:", e);
      this.listContainer.innerHTML = '<p style="text-align:center; padding:20px; color:red;">댓글을 불러오지 못했습니다. (URL 및 권한 확인 필요)</p>';
    }
  },

  displayComments(comments) {
    if (!comments || comments.length === 0) {
      this.listContainer.innerHTML = '<p style="text-align:center; padding:20px;">등록된 댓글이 없습니다.</p>';
      return;
    }

    this.listContainer.innerHTML = comments.map(c => {
      // 서버용 원본 ID (ISOString)
      const originalId = String(c.id);
      // HTML 요소용 안전한 ID (특수문자 제거)
      const safeHtmlId = originalId.replace(/[^a-zA-Z0-9]/g, ""); 
      
      const date = new Date(originalId);
      const formattedDate = isNaN(date.getTime()) ? "방금 전" : date.toLocaleString('ko-KR', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: false
      });

      return `
        <div class="comment-item">
          <div class="comment-content">${c.content}</div>
          <div class="comment-footer">
            <span class="comment-date">${formattedDate}</span>
            <div class="btn-group">
              <button class="edit-btn" onclick="CommentsModule.openActionField('${originalId}', 'update')">수정</button>
              <button class="del-btn" onclick="CommentsModule.openActionField('${originalId}', 'delete')">삭제</button>
            </div>
          </div>
          <!-- 수정/삭제 영역 -->
          <div id="action-area-${safeHtmlId}" class="edit-field-container" style="display:none; margin-top:10px;">
            <textarea id="edit-input-${safeHtmlId}" class="edit-textarea">${c.content}</textarea>
            <div class="edit-form-bottom">
              <input type="password" id="action-pw-${safeHtmlId}" placeholder="비밀번호" class="edit-pw-input">
              <div class="edit-btns">
                <button id="action-submit-${safeHtmlId}" class="submit-edit-btn">확인</button>
                <button onclick="CommentsModule.closeActionField('${originalId}')" class="cancel-edit-btn">취소</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  renderPagination(total, current) {
    const totalPages = Math.ceil(total / this.config.pageSize);
    if (totalPages <= 1) {
      this.pageContainer.innerHTML = '';
      return;
    }

    let html = '';
    for (let i = 1; i <= totalPages; i++) {
      html += `<button class="page-btn ${i === current ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
    }
    this.pageContainer.innerHTML = html;
  },

  openActionField(id, action) {
    const safeHtmlId = id.replace(/[^a-zA-Z0-9]/g, "");
    document.querySelectorAll('.edit-field-container').forEach(el => el.style.display = 'none');
    
    const area = document.getElementById(`action-area-${safeHtmlId}`);
    const input = document.getElementById(`edit-input-${safeHtmlId}`);
    const submitBtn = document.getElementById(`action-submit-${safeHtmlId}`);
    
    if (!area) return;
    area.style.display = 'block';
    
    if (action === 'delete') {
      if (input) input.style.display = 'none';
      submitBtn.innerText = '삭제 확정';
    } else {
      if (input) input.style.display = 'block';
      submitBtn.innerText = '수정 완료';
    }
    
    // 원본 id를 전달하도록 설정
    submitBtn.onclick = () => this.submitAction(id, action);
  },

  closeActionField(id) {
    const safeHtmlId = id.replace(/[^a-zA-Z0-9]/g, "");
    const area = document.getElementById(`action-area-${safeHtmlId}`);
    if (area) area.style.display = 'none';
  },

  async submitAction(id, action) {
    const safeHtmlId = id.replace(/[^a-zA-Z0-9]/g, "");
    const password = document.getElementById(`action-pw-${safeHtmlId}`).value.trim();
    const content = action === 'update' ? document.getElementById(`edit-input-${safeHtmlId}`).value.trim() : "";
    
    if (action === 'update' && !content) return alert("내용을 입력하세요.");
    if (!password) return alert("비밀번호를 입력하세요.");

    try {
      const res = await fetch(this.config.apiUrl, {
        method: 'POST',
        body: JSON.stringify({ action, id, content, password })
      });
      const result = await res.json();

      if (result.status === 200) {
        alert(action === 'update' ? "수정되었습니다." : "삭제되었습니다.");
        this.cache = {}; 
        this.render(1);
      } else {
        alert(result.message || "비밀번호가 틀렸습니다.");
      }
    } catch (e) {
      alert("작업 실패: 서버 연결 상태를 확인하세요.");
    }
  },

  async postComment(content, password) {
    try {
      const res = await fetch(this.config.apiUrl, {
        method: 'POST',
        body: JSON.stringify({ action: 'create', content, password })
      });
      const result = await res.json();
      if (result.status === 200) this.cache = {}; 
      return result;
    } catch (e) {
      return { status: 500 };
    }
  }
};

window.changePage = (p) => CommentsModule.render(p);
