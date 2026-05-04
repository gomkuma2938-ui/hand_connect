export const CommentsModule = {
  config: {
    apiUrl: 'https://script.google.com/macros/s/AKfycbwHeAcOZjRIECbK1txd9inRnnFkEVbW39Rfrpg4qyTMxxdB7gKmroAEABUgzc_8wdXupQ/exec', // 실제 배포 URL로 교체
    masterPw: '8124'
  },

  async init(containerId) {
    this.listContainer = document.getElementById(containerId);
    this.pageContainer = document.getElementById('pagination');
    await this.render(1);
  },

  // 댓글 목록 호출 및 렌더링
  async render(page = 1) {
    this.listContainer.innerHTML = '<p style="text-align:center">불러오는 중...</p>';
    try {
      const response = await fetch(`${this.config.apiUrl}?page=${page}`);
      const result = await response.json();
      
      this.displayComments(result.data);
      this.displayPagination(result.total, page);
    } catch (e) {
      this.listContainer.innerHTML = '<p>댓글을 불러오지 못했습니다.</p>';
    }
  },

  displayComments(comments) {
    if (comments.length === 0) {
      this.listContainer.innerHTML = '<p style="text-align:center; color:#999;">첫 댓글을 남겨보세요.</p>';
      return;
    }

    this.listContainer.innerHTML = comments.map(c => `
      <div class="comment-item">
        <div class="comment-content">${c.content}</div>
        <div class="comment-date">${new Date(c.id).toLocaleString()}</div>
        <div class="comment-actions">
          <button onclick="deleteComment('${c.id}')">삭제</button>
        </div>
      </div>
    `).join('');
  },

  // 5페이지 단위 페이지네이션 로직
  displayPagination(total, current) {
    const totalPages = Math.ceil(total / 15);
    const groupSize = 5;
    const currentGroup = Math.ceil(current / groupSize);
    const startPage = (currentGroup - 1) * groupSize + 1;
    const endPage = Math.min(startPage + groupSize - 1, totalPages);

    let html = '';
    
    // 이전 화살표
    if (currentGroup > 1) {
      html += `<button class="page-btn page-arrow" onclick="changePage(${startPage - 1})">&lt;</button>`;
    }

    // 숫자 버튼
    for (let i = startPage; i <= endPage; i++) {
      html += `<button class="page-btn ${i === current ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
    }

    // 다음 화살표
    if (endPage < totalPages) {
      html += `<button class="page-btn page-arrow" onclick="changePage(${endPage + 1})">&gt;</button>`;
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

  // 댓글 삭제 (비밀번호 확인창 띄우기)
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
      this.render(1);
    } else {
      alert("비밀번호가 틀렸습니다.");
    }
  }
};

// 전역 함수 연결 (인라인 이벤트 대응)
window.changePage = (p) => CommentsModule.render(p);
window.deleteComment = (id) => CommentsModule.handleDelete(id);
