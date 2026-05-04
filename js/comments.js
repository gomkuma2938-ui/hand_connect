export const CommentsModule = {
  config: {
    apiUrl: 'https://script.google.com/macros/s/AKfycbwHeAcOZjRIECbK1txd9inRnnFkEVbW39Rfrpg4qyTMxxdB7gKmroAEABUgzc_8wdXupQ/exec', 
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
      console.error("데이터 로드 실패:", e);
      this.listContainer.innerHTML = '<p style="text-align:center; padding:20px; color:red;">댓글을 불러오지 못했습니다.</p>';
    }
  },

  displayComments(comments) {
    if (!comments || comments.length === 0) {
      this.listContainer.innerHTML = '<p style="text-align:center; padding:20px;">등록된 댓글이 없습니다.</p>';
      return;
    }

    this.listContainer.innerHTML = comments.map(c => {
      const date = new Date(c.id);
      const formattedDate = isNaN(date) ? "방금 전" : date.toLocaleString('ko-KR', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: false
      });

      return `
        <div class="comment-item" id="item-${c.id}">
          <div class="comment-content">${c.content}</div>
          <div class="comment-footer">
            <span class="comment-date">${formattedDate}</span>
            <div class="btn-group">
              <button class="edit-btn" onclick="CommentsModule.openActionField('${c.id}', 'update')">수정</button>
              <button class="del-btn" onclick="CommentsModule.openActionField('${c.id}', 'delete')">삭제</button>
            </div>
          </div>
          <div id="action-area-${c.id}" class="edit-field-container" style="display:none; margin-top:10px;">
            <textarea id="edit-input-${c.id}" class="edit-textarea">${c.content}</textarea>
            <div class="edit-form-bottom">
              <input type="password" id="action-pw-${c.id}" placeholder="비밀번호" class="edit-pw-input">
              <div class="edit-btns">
                <button id="action-submit-${c.id}" class="submit-edit-btn">확인</button>
                <button onclick="CommentsModule.closeActionField('${c.id}')" class="cancel-edit-btn">취소</button>
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
    const groupSize = this.config.pageGroupSize;
    const currentGroup = Math.ceil(current / groupSize);
    const startPage = (currentGroup - 1) * groupSize + 1;
    const endPage = Math.min(currentGroup * groupSize, totalPages);

    let html = '';
    if (currentGroup > 1) html += `<button class="page-btn arrow" onclick="changePage(${startPage - 1})">&lt;</button>`;
    for (let i = startPage; i <= endPage; i++) {
      html += `<button class="page-btn ${i === current ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
    }
    if (endPage < totalPages) html += `<button class="page-btn arrow" onclick="changePage(${endPage + 1})">&gt;</button>`;
    this.pageContainer.innerHTML = html;
  },

  openActionField(id, action) {
    document.querySelectorAll('.edit-field-container').forEach(el => el.style.display = 'none');
    const area = document.getElementById(`action-area-${id}`);
    const input = document.getElementById(`edit-input-${id}`);
    const submitBtn = document.getElementById(`action-submit-${id}`);
    
    if (!area) return;
    area.style.display = 'block';
    
    if (action === 'delete') {
      if (input) input.style.display = 'none';
      submitBtn.innerText = '삭제 확정';
    } else {
      if (input) input.style.display = 'block';
      submitBtn.innerText = '수정 완료';
    }
    submitBtn.onclick = () => this.submitAction(id, action);
  },

  closeActionField(id) {
    const area = document.getElementById(`action-area-${id}`);
    if (area) area.style.display = 'none';
  },

  async submitAction(id, action) {
    const password = document.getElementById(`action-pw-${id}`).value.trim();
    const content = action === 'update' ? document.getElementById(`edit-input-${id}`).value.trim() : "";
    
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
      alert("작업 실패: 서버 연결을 확인하세요.");
    }
  },

  async postComment(content, password) {
    try {
      const res = await fetch(this.config.apiUrl, {
        method: 'POST',
        body: JSON.stringify({ action: 'create', content, password })
      });
      const result = await res.json();
      if (result.status === 200) {
        this.cache = {}; 
      }
      return result;
    } catch (e) {
      console.error("등록 실패:", e);
      return { status: 500 };
    }
  }
};

window.changePage = (p) => CommentsModule.render(p);
