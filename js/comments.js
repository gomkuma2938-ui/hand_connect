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
      // 1. 데이터 가져오기
      const response = await fetch(`${this.config.apiUrl}?page=${page}`);
      const result = await response.json(); 

      // 2. 데이터 유효성 검사 ( result.data가 있으면 쓰고 없으면 빈 배열 )
      const comments = result.data || [];
      const total = result.total || 0;
      const pageSize = result.pageSize || 15;

      // 3. 댓글이 하나도 없을 때의 처리
      if (comments.length === 0) {
        this.listContainer.innerHTML = '<p style="text-align:center; color:#999; padding:40px;">등록된 댓글이 없습니다.</p>';
        this.pageContainer.innerHTML = '';
        return;
      }

      // 4. 화면에 댓글 리스트 생성 (id는 날짜 텍스트 그대로 표시)
      this.listContainer.innerHTML = comments.map(c => `
        <div class="comment-item">
          <div class="comment-content">${c.content}</div>
          <div class="comment-date" style="font-size:0.8rem; color:#999; margin-top:5px;">${c.id}</div>
          <div class="comment-actions" style="text-align:right; margin-top:5px;">
            <button class="del-btn" onclick="deleteComment('${c.id}')" style="cursor:pointer; font-size:0.7rem; padding:2px 5px;">삭제</button>
          </div>
        </div>
      `).join('');

      // 5. 페이지네이션 생성
      this.renderPagination(total, page, pageSize);

    } catch (e) {
      console.error("로딩 실패:", e);
      this.listContainer.innerHTML = '<p style="text-align:center; color:red; padding:20px;">데이터를 불러오는 중 오류가 발생했습니다.</p>';
    }
  },

  // 페이지네이션 번호 생성 로직
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
    
    // 이전 그룹 화살표
    if (currentGroup > 1) {
      html += `<button class="page-btn" onclick="changePage(${startPage - 1})">&lt;</button>`;
    }

    // 숫자 버튼들
    for (let i = startPage; i <= endPage; i++) {
      html += `<button class="page-btn ${i === current ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
    }

    // 다음 그룹 화살표
    if (endPage < totalPages) {
      html += `<button class="page-btn" onclick="changePage(${endPage + 1})">&gt;</button>`;
    }

    this.pageContainer.innerHTML = html;
  },

  // 댓글 작성 처리
  async postComment(content, password) {
    const response = await fetch(this.config.apiUrl, {
      method: 'POST',
      body: JSON.stringify({ action: 'create', content, password })
    });
    return await response.json();
  },

  // 댓글 삭제 처리
  async handleDelete(id) {
    const pw = prompt("비밀번호를 입력하세요.");
    if (!pw) return;

    try {
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
    } catch (e) {
      alert("삭제 중 오류가 발생했습니다.");
    }
  }
};

// ❗ 중요: 버튼 클릭 시 함수를 찾을 수 있게 전역(window)에 연결
window.changePage = (p) => CommentsModule.render(p);
window.deleteComment = (id) => CommentsModule.handleDelete(id);
