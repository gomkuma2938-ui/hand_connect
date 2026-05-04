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
      const result = await response.json(); 
      
      this.cache[page] = result;
      this.displayComments(result.data);
      this.renderPagination(result.total, page);
    } catch (e) {
      this.listContainer.innerHTML = '<p style="text-align:center; padding:20px; color:red;">데이터 로드 실패</p>';
    }
  },

  displayComments(comments) {
    // 리스트 영역 상단에 제목 배치 (CSS에서 중앙 정렬 처리)
    const titleHtml = `<h3 class="comments-title">기도 동참하기🙏</h3>`;

    if (!comments || comments.length === 0) {
      this.listContainer.innerHTML = titleHtml + '<p style="text-align:center; padding:20px;">등록된 댓글이 없습니다.</p>';
      return;
    }

    const listHtml = comments.map(c => {
      const idStr = String(c.id);
      const safeId = idStr.replace(/[^a-zA-Z0-9]/g, ""); 
      
      return `
        <div class="comment-item">
          <div class="comment-content">${c.content}</div>
          <div class="comment-footer">
            <span class="comment-date">${idStr.includes('T') ? new Date(idStr).toLocaleString() : '이전 기록'}</span>
            <div class="btn-group">
              <button class="edit-btn" data-id="${idStr}" data-action="update">수정</button>
              <button class="del-btn" data-id="${idStr}" data-action="delete">삭제</button>
            </div>
          </div>
          <div id="action-area-${safeId}" class="edit-field-container" style="display:none;">
            <textarea id="edit-input-${safeId}" class="edit-textarea">${c.content}</textarea>
            <div class="edit-form-bottom">
              <input type="password" id="action-pw-${safeId}" placeholder="PW" class="edit-pw-input">
              <div class="edit-btns">
                <button id="action-submit-${safeId}" class="submit-edit-btn">확인</button>
                <button class="cancel-btn" data-id="${idStr}">취소</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    this.listContainer.innerHTML = titleHtml + listHtml;

    // 이벤트 바인딩
    this.listContainer.querySelectorAll('.edit-btn, .del-btn').forEach(btn => {
      btn.onclick = () => this.openActionField(btn.dataset.id, btn.dataset.action);
    });
    this.listContainer.querySelectorAll('.cancel-btn').forEach(btn => {
      btn.onclick = () => this.closeActionField(btn.dataset.id);
    });
  },

  // ... 나머지 pagination, openActionField, submitAction 로직은 동일
};
