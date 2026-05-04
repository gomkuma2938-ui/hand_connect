export const CommentsModule = {
  config: {
    apiUrl: 'https://script.google.com/macros/s/AKfycbwHeAcOZjRIECbK1txd9inRnnFkEVbW39Rfrpg4qyTMxxdB7gKmroAEABUgzc_8wdXupQ/exec'
  },

  async init(containerId) {
    this.listContainer = document.getElementById(containerId);
    this.pageContainer = document.getElementById('pagination');
    await this.render(1);
  },

  async render(page = 1) {
    try {
      const response = await fetch(`${this.config.apiUrl}?page=${page}`);
      const result = await response.json(); 
      const comments = result.data || [];
      
      if (comments.length === 0) {
        this.listContainer.innerHTML = '<p style="text-align:center; padding:20px;">등록된 댓글이 없습니다.</p>';
        return;
      }

      this.listContainer.innerHTML = comments.map(c => {
        const date = new Date(c.id);
        const formattedDate = isNaN(date) ? c.id : date.toLocaleString('ko-KR', {
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit', hour12: false
        });

        return `
        <div class="comment-item" id="item-${c.id}">
          <div class="comment-content">${c.content}</div>
          <div class="comment-footer">
            <span class="comment-date">${formattedDate}</span>
            <div class="btn-group">
              <button class="edit-btn" onclick="CommentsModule.toggleEditField('${c.id}', '${c.content.replace(/'/g, "\\'")}')">수정</button>
              <button class="del-btn" onclick="CommentsModule.handleDelete('${c.id}')">삭제</button>
            </div>
          </div>
          <!-- ❗ 수정 필드가 펼쳐질 공간 -->
          <div id="edit-area-${c.id}" class="edit-field-container" style="display:none; margin-top:10px;">
            <textarea id="edit-input-${c.id}" class="edit-textarea">${c.content}</textarea>
            <div class="edit-form-bottom">
              <input type="password" id="edit-pw-${c.id}" placeholder="비밀번호" class="edit-pw-input">
              <div class="edit-btns">
                <button onclick="CommentsModule.submitEdit('${c.id}')" class="submit-edit-btn">완료</button>
                <button onclick="CommentsModule.toggleEditField('${c.id}')" class="cancel-edit-btn">취소</button>
              </div>
            </div>
          </div>
        </div>
      `}).join('');
      
      this.renderPagination(result.total, page, result.pageSize);
    } catch (e) {
      console.error("로딩 실패:", e);
      this.listContainer.innerHTML = '<p style="text-align:center; color:red;">데이터 연결 지연 중입니다.</p>';
    }
  },

  // ❗ 수정 필드 토글 (펼치기/접기)
  toggleEditField(id, content) {
    const editArea = document.getElementById(`edit-area-${id}`);
    const isOpening = editArea.style.display === 'none';
    
    // 다른 열려있는 수정창 닫기 (선택사항)
    document.querySelectorAll('.edit-field-container').forEach(el => el.style.display = 'none');
    
    if (isOpening) {
      editArea.style.display = 'block';
      if (content) document.getElementById(`edit-input-${id}`).value = content;
    }
  },

  // ❗ 실제 수정 처리 (비밀번호 검증 필수)
  async submitEdit(id) {
    const newContent = document.getElementById(`edit-input-${id}`).value.trim();
    const password = document.getElementById(`edit-pw-${id}`).value.trim();

    if (!newContent) return alert("내용을 입력하세요.");
    if (!password) return alert("비밀번호를 입력하세요.");

    const res = await fetch(this.config.apiUrl, {
      method: 'POST',
      body: JSON.stringify({ action: 'update', id, content: newContent, password })
    });

    const result = await res.json();
    if (result.status === 200) {
      alert("수정되었습니다.");
      this.render(1);
    } else {
      alert("비밀번호가 틀렸습니다.");
    }
  },

  async postComment(content, password) {
    const response = await fetch(this.config.apiUrl, {
      method: 'POST',
      body: JSON.stringify({ action: 'create', content, password })
    });
    return await response.json();
  },

  async handleDelete(id) {
    const pw = prompt("삭제를 위해 비밀번호를 입력하세요."); // 삭제는 간단하게 prompt 유지하거나 위와 같은 방식으로 통일 가능
    if (!pw) return;

    const res = await fetch(this.config.apiUrl, {
      method: 'POST',
      body: JSON.stringify({ action: 'delete', id, password: pw })
    });

    const result = await res.json();
    if (result.status === 200) {
      alert("삭제되었습니다.");
      this.render(1); 
    } else {
      alert("비밀번호가 틀렸습니다.");
    }
  },

  renderPagination(total, current, pageSize) {
    const totalPages = Math.ceil(total / pageSize);
    if (totalPages <= 1) {
      this.pageContainer.innerHTML = '';
      return;
    }
    let html = '';
    for (let i = 1; i <= totalPages; i++) {
      html += `<button class="page-btn ${i === current ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
    }
    this.pageContainer.innerHTML = html;
  }
};

window.changePage = (p) => CommentsModule.render(p);
