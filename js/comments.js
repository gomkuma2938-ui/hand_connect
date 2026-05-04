export const CommentsModule = {
  config: {
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
      this.listContainer.innerHTML = '<p style="text-align:center; padding:20px; color:red;">데이터를 불러오지 못했습니다.</p>';
    }
  },

  displayComments(comments) {
    // 1. 상단 제목 추가 (디자인에 맞춰 스타일 조절 가능)
    const titleHtml = `<h3 class="comments-title">기도 동참하기🙏</h3>`;

    if (!comments || comments.length === 0) {
      this.listContainer.innerHTML = titleHtml + '<p style="text-align:center; padding:20px;">등록된 댓글이 없습니다.</p>';
      return;
    }

    const listHtml = comments.map(c => {
      const originalId = String(c.id);
      const safeHtmlId = originalId.replace(/[^a-zA-Z0-9]/g, ""); 
      const date = new Date(originalId);
      const formattedDate = isNaN(date.getTime()) ? "방금 전" : date.toLocaleString('ko-KR');

      return `
        <div class="comment-item">
          <div class="comment-content">${c.content}</div>
          <div class="comment-footer">
            <span class="comment-date">${formattedDate}</span>
            <div class="btn-group">
              <button class="edit-btn" data-id="${originalId}" data-action="update">수정</button>
              <button class="del-btn" data-id="${originalId}" data-action="delete">삭제</button>
            </div>
          </div>
          <div id="action-area-${safeHtmlId}" class="edit-field-container" style="display:none; margin-top:10px;">
            <textarea id="edit-input-${safeHtmlId}" class="edit-textarea">${c.content}</textarea>
            <div class="edit-form-bottom">
              <input type="password" id="action-pw-${safeHtmlId}" placeholder="비밀번호" class="edit-pw-input">
              <div class="edit-btns">
                <button id="action-submit-${safeHtmlId}" class="submit-edit-btn">확인</button>
                <button class="cancel-btn" data-id="${originalId}">취소</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    this.listContainer.innerHTML = titleHtml + listHtml;

    // 이벤트 리스너 바인딩
    this.listContainer.querySelectorAll('.edit-btn, .del-btn').forEach(btn => {
      btn.onclick = () => this.openActionField(btn.dataset.id, btn.dataset.action);
    });
    this.listContainer.querySelectorAll('.cancel-btn').forEach(btn => {
      btn.onclick = () => this.closeActionField(btn.dataset.id);
    });
  },

  renderPagination(total, current) {
    const totalPages = Math.ceil(total / this.config.pageSize);
    if (totalPages <= 1) { this.pageContainer.innerHTML = ''; return; }

    const groupSize = this.config.pageGroupSize;
    const currentGroup = Math.ceil(current / groupSize);
    const startPage = (currentGroup - 1) * groupSize + 1;
    const endPage = Math.min(startPage + groupSize - 1, totalPages);

    let html = '';
    if (currentGroup > 1) {
      html += `<button class="page-btn" onclick="changePage(${startPage - 1})">이전</button>`;
    }

    for (let i = startPage; i <= endPage; i++) {
      html += `<button class="page-btn ${i === current ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
    }

    if (endPage < totalPages) {
      html += `<button class="page-btn" onclick="changePage(${endPage + 1})">다음</button>`;
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
      submitBtn.innerText = '삭제';
    } else {
      if (input) input.style.display = 'block';
      submitBtn.innerText = '수정';
    }
    
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
        alert("완료되었습니다.");
        this.cache = {}; 
        this.render(1);
      } else {
        alert(result.message || "비밀번호가 틀렸습니다.");
      }
    } catch (e) {
      alert("서버 연결 실패");
    }
  }
};

window.changePage = (p) => CommentsModule.render(p);
