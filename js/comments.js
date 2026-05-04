export const CommentsModule = {
  config: {
    // 실제 구글 앱스 스크립트 배포 URL
    apiUrl: 'https://script.google.com/macros/s/AKfycbwHeAcOZjRIECbK1txd9inRnnFkEVbW39Rfrpg4qyTMxxdB7gKmroAEABUgzc_8wdXupQ/exec',
    masterPw: '8124'
  },

  async init(containerId) {
    this.listContainer = document.getElementById(containerId);
    this.pageContainer = document.getElementById('pagination');
    // 초기 로딩 시 1페이지 호출
    await this.render(1);
  },

  // 댓글 목록 호출 및 화면에 그리기
  async render(page = 1) {
    try {
      const response = await fetch(`${this.config.apiUrl}?page=${page}`);
      const result = await response.json(); 

      // 백엔드에서 준 { data, total, pageSize } 구조를 가져옴
      const comments = result.data || [];
      const total = result.total || 0;
      const pageSize = result.pageSize || 15;

      if (comments.length === 0) {
        this.listContainer.innerHTML = '<p style="text-align:center; color:#999; padding:20px;">첫 번째 기도를 남겨주세요.</p>';
        this.pageContainer.innerHTML = '';
        return;
      }

      // 1. 댓글 리스트 생성
      this.listContainer.innerHTML = comments.map(c => `
        <div class="comment-item">
          <div class="comment-content">${c.content}</div>
          <div class="comment-date">${new Date(c.id).toLocaleString()}</div>
          <div class="comment-actions">
            <button class="del-btn" onclick="deleteComment('${c.id}')">삭제</button>
          </div>
        </div>
      `).join('');

      // 2. 페이지네이션 생성
      this.renderPagination(total, page, pageSize);

    } catch (e) {
      console.error("댓글 로딩 에러:", e);
      this.listContainer.innerHTML = '<p style="text-align:center; color:red;">댓글을 불러오지 못했습니다.</p>';
    }
  },

  // 페이지네이션 번호 생성
  renderPagination(total, current, pageSize) {
    const totalPages = Math.ceil(total / pageSize);
    if (totalPages <= 1) {
      this.pageContainer.innerHTML = '';
      return;
    }

    const groupSize = 5;
    const currentGroup = Math.ceil(current / groupSize);
    const startPage = (currentGroup - 1) * groupSize + 1;
    const endPage = Math.min(startPage + groupSize - 1, totalPages);

    let html = '';
    
    if (currentGroup > 1) {
      html += `<button class="page-btn" onclick="changePage(${startPage - 1})">&lt;</button>`;
    }

    for (let i = startPage; i <= endPage; i++) {
      html += `<button class="page-btn ${i === current ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
    }

    if (endPage < totalPages) {
      html += `<button class="page-btn" onclick="changePage(${endPage + 1})">&gt;</button>`;
    }

    this.pageContainer.innerHTML = html;
  },

  // 댓글 작성
  async postComment(content, password) {
    const response = await fetch(this.config.apiUrl, {
      method: 'POST',
      body: JSON.stringify({ action: 'create', content, password })
    });
    return await response.json();
  },

  // 댓글 삭제
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
      location.reload(); // 안온하게 새로고침
    } else {
      alert("비밀번호가 틀렸습니다.");
    }
  }
};

// 전역 연결
window.changePage = (p) => CommentsModule.render(p);
window.deleteComment = (id) => CommentsModule.handleDelete(id);
