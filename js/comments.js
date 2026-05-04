export const CommentsModule = {
  config: {
    apiUrl: 'https://script.google.com/macros/s/AKfycbwHeAcOZjRIECbK1txd9inRnnFkEVbW39Rfrpg4qyTMxxdB7gKmroAEABUgzc_8wdXupQ/exec',
    pageSize: 10, // 10개 단위로 변경
    pageGroupSize: 5 // 5개 단위로 화살표 처리
  },

  async init(containerId) {
    this.listContainer = document.getElementById(containerId);
    this.pageContainer = document.getElementById('pagination');
    await this.render(1);
  },

  async render(page = 1) {
    try {
      // pageSize를 쿼리에 포함하여 요청 (서버 로직에 따라 적용)
      const response = await fetch(`${this.config.apiUrl}?page=${page}&pageSize=${this.config.pageSize}`);
      const result = await response.json(); 
      const comments = result.data || [];
      
      if (comments.length === 0) {
        this.listContainer.innerHTML = '<p style="text-align:center; padding:20px;">등록된 댓글이 없습니다.</p>';
        return;
      }

      // 댓글 리스트 렌더링 부분 (기존과 동일)
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
              <button class="edit-btn" onclick="CommentsModule.openActionField('${c.id}', 'update')">수정</button>
              <button class="del-btn" onclick="CommentsModule.openActionField('${c.id}', 'delete')">삭제</button>
            </div>
          </div>
          <div id="action-area-${c.id}" class="edit-field-container" style="display:none; margin-top:10px;">
            <div id="edit-content-wrapper-${c.id}">
                <textarea id="edit-input-${c.id}" class="edit-textarea">${c.content}</textarea>
            </div>
            <div class="edit-form-bottom">
              <input type="password" id="action-pw-${c.id}" placeholder="비밀번호" class="edit-pw-input">
              <div class="edit-btns">
                <button id="action-submit-${c.id}" class="submit-edit-btn">확인</button>
                <button onclick="CommentsModule.closeActionField('${c.id}')" class="cancel-edit-btn">취소</button>
              </div>
            </div>
          </div>
        </div>
      `}).join('');
      
      // 페이지네이션 호출 (수정된 로직)
      this.renderPagination(result.total, page);
    } catch (e) {
      console.error("로딩 실패:", e);
      this.listContainer.innerHTML = '<p style="text-align:center; color:red;">데이터를 불러올 수 없습니다.</p>';
    }
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

    // 이전 그룹 화살표
    if (currentGroup > 1) {
      html += `<button class="page-btn arrow" onclick="changePage(${startPage - 1})">&lt;</button>`;
    }

    // 숫자 페이지
    for (let i = startPage; i <= endPage; i++) {
      html += `<button class="page-btn ${i === current ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
    }

    // 다음 그룹 화살표
    if (endPage < totalPages) {
      html += `<button class="page-btn arrow" onclick="changePage(${endPage + 1})">&gt;</button>`;
    }

    this.pageContainer.innerHTML = html;
  },

  // ... (openActionField, closeActionField, submitAction, postComment 등 기존 함수 유지)
  openActionField(id, action) {
    const actionArea = document.getElementById(`action-area-${id}`);
    const contentWrapper = document.getElementById(`edit-content-wrapper-${id}`);
    const submitBtn = document.getElementById(`action-submit-${id}`);
    document.querySelectorAll('.edit-field-container').forEach(el => el.style.display = 'none');
    actionArea.style.display = 'block';
    if (action === 'delete') {
      contentWrapper.style.display = 'none';
      submitBtn.innerText = '삭제 확정';
      submitBtn.onclick = () => this.submitAction(id, 'delete');
    } else {
      contentWrapper.style.display = 'block';
      submitBtn.innerText = '수정 완료';
      submitBtn.onclick = () => this.submitAction(id, 'update');
    }
  },

  closeActionField(id) {
    document.getElementById(`action-area-${id}`).style.display = 'none';
  },

  async submitAction(id, action) {
    const password = document.getElementById(`action-pw-${id}`).value.trim();
    const content = action === 'update' ? document.getElementById(`edit-input-${id}`).value.trim() : "";
    if (action === 'update' && !content) return alert("내용을 입력하세요.");
    if (!password) return alert("비밀번호를 입력하세요.");
    const res = await fetch(this.config.apiUrl, {
      method: 'POST',
      body: JSON.stringify({ action, id, content, password })
    });
    const result = await res.json();
    if (result.status === 200) {
      alert(action === 'update' ? "수정되었습니다." : "삭제되었습니다.");
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
  }
};

window.changePage = (p) => CommentsModule.render(p);
