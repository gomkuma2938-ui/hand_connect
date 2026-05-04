export const CommentsModule = {
  config: {
    apiUrl: 'https://script.google.com/macros/s/AKfycbwHeAcOZjRIECbK1txd9inRnnFkEVbW39Rfrpg4qyTMxxdB7gKmroAEABUgzc_8wdXupQ/exec',
    masterPw: '8124'
  },

  async init(containerId) {
    this.listContainer = document.getElementById(containerId);
    this.pageContainer = document.getElementById('pagination');
    await this.render(1);
  },

  async render(page = 1) {
    try {
      // 주소창에서 확인하신 그 데이터를 가져옵니다.
      const response = await fetch(`${this.config.apiUrl}?page=${page}`);
      const result = await response.json(); 

      // 결과값 구조에 맞춰 데이터를 추출합니다.
      const comments = result.data || [];
      
      if (comments.length === 0) {
        this.listContainer.innerHTML = '<p style="text-align:center; padding:20px;">등록된 댓글이 없습니다.</p>';
        return;
      }

      // 화면에 그리기
    this.listContainer.innerHTML = comments.map(c => `
      <div class="comment-item">
        <div class="comment-content">${c.content}</div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
          <span style="font-size:0.75rem; color:#999;">${c.id}</span>
          <div class="btn-group">
            <button class="edit-btn" onclick="editComment('${c.id}', '${c.content}')">수정</button>
            <button class="del-btn" onclick="deleteComment('${c.id}')">삭제</button>
          </div>
        </div>
      </div>
    `).join('');
    
    // 수정 기능 로직 추가
    async handleEdit(id, oldContent) {
      const newContent = prompt("수정할 내용을 입력하세요.", oldContent);
      if (!newContent || newContent === oldContent) return;
    
      const pw = prompt("비밀번호를 입력하세요.");
      if (!pw) return;
    
      const res = await fetch(this.config.apiUrl, {
        method: 'POST',
        body: JSON.stringify({ action: 'update', id, content: newContent, password: pw })
      });
    
      const result = await res.json();
      if (result.status === 200) {
        alert("수정되었습니다.");
        this.render(1); // 페이지 새로고침 없이 리스트만 갱신
      } else {
        alert("비밀번호가 틀렸습니다.");
      }
    }
    
    // 전역 연결
    window.editComment = (id, content) => CommentsModule.handleEdit(id, content);

      // 페이지네이션 실행
      this.renderPagination(result.total, page, result.pageSize);

    } catch (e) {
      console.error("로딩 실패:", e);
      this.listContainer.innerHTML = '<p style="text-align:center; color:red;">데이터 연결 지연 중입니다. 잠시 후 새로고침 해주세요.</p>';
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
      html += `<button class="page-btn ${i === current ? 'active' : ''}" onclick="changePage(${i})" style="margin:0 2px;">${i}</button>`;
    }
    this.pageContainer.innerHTML = html;
  },

  async postComment(content, password) {
    const response = await fetch(this.config.apiUrl, {
      method: 'POST',
      body: JSON.stringify({ action: 'create', content, password })
    });
    return await response.json();
  },

  async handleDelete(id) {
    const pw = prompt("비밀번호를 입력하세요.");
    if (!pw) return;

    const res = await fetch(this.config.apiUrl, {
      method: 'POST',
      body: JSON.stringify({ action: 'delete', id, password: pw })
    });

    const result = await res.json();
    if (result.status === 200) {
      alert("삭제되었습니다.");
      location.reload(); 
    } else {
      alert("비밀번호가 틀렸습니다.");
    }
  }
};

window.changePage = (p) => CommentsModule.render(p);
window.deleteComment = (id) => CommentsModule.handleDelete(id);
