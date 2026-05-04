export const CommentsModule = {
    config: {
        apiUrl: 'https://script.google.com/macros/s/AKfycbyVKORhy8YN5vaWf6xIrikRjYwhodtfEQDdkpXvPALD-GIfXlW-kqOr81H_gvRfvXhg6g/exec',
        pageSize: 10
    },

    async init(containerId) {
        this.listContainer = document.getElementById(containerId);
        this.pageContainer = document.getElementById('pagination');
        if (!this.listContainer) return;
        await this.render(1);
    },

    async render(page = 1) {
        try {
            this.listContainer.innerHTML = '<div class="spinner-container"><div class="spinner"></div></div>';
            const url = `${this.config.apiUrl}?page=${page}&pageSize=${this.config.pageSize}&_=${new Date().getTime()}`;
            const res = await fetch(url);
            const result = await res.json();
            this.displayComments(result.data || []);
            this.renderPagination(result.total || 0, page);
        } catch (e) {
            this.listContainer.innerHTML = `<p style="text-align:center; padding:20px;">댓글 로드 실패</p>`;
        }
    },

    displayComments(data) {
        if (data.length === 0) {
            this.listContainer.innerHTML = '<p style="text-align:center; padding:20px; color:#999;">첫 기도를 남겨주세요.</p>';
            return;
        }
        this.listContainer.innerHTML = data.map(item => {
            const safeId = String(item.id).replace(/[^a-zA-Z0-9]/g, "");
            
            // ❗ 날짜 포맷팅: YY.MM.DD 형식 (26.05.04)
            let displayDate = "";
            if (item.id) {
                const dateObj = new Date(item.id);
                const yy = String(dateObj.getFullYear()).slice(-2);
                const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
                const dd = String(dateObj.getDate()).padStart(2, '0');
                displayDate = `${yy}.${mm}.${dd}`;
            }

            return `
                <div class="comment-item">
                    <div class="comment-content">${item.content.replace(/\n/g, '<br>')}</div>
                    <div class="comment-footer">
                        <span class="comment-date">${displayDate}</span>
                        <div class="btn-group">
                            <button class="edit-btn" onclick="CommentsModule.toggleField('${safeId}', 'update')">수정</button>
                            <button class="del-btn" onclick="CommentsModule.toggleField('${safeId}', 'delete')">삭제</button>
                        </div>
                    </div>
                    <div id="field-${safeId}" class="edit-field-container" style="display:none;">
                        <textarea id="area-${safeId}" class="edit-textarea" style="display:none;">${item.content}</textarea>
                        <div class="edit-form-bottom">
                            <input type="password" id="pw-${safeId}" class="edit-pw-input" placeholder="비밀번호(4자 이상)">
                            <div class="edit-btns">
                                <button class="cancel-btn" onclick="CommentsModule.toggleField('${safeId}')">취소</button>
                                <button class="submit-edit-btn" onclick="CommentsModule.submitAction('${item.id}', '${safeId}')">확인</button>
                            </div>
                        </div>
                        <div id="msg-${safeId}" class="error-msg" style="display:none;"></div>
                    </div>
                </div>`;
        }).join('');
    },

    toggleField(safeId, type) {
        const field = document.getElementById(`field-${safeId}`);
        const area = document.getElementById(`area-${safeId}`);
        if (!type) { field.style.display = 'none'; return; }
        field.style.display = 'block';
        field.dataset.action = type;
        area.style.display = (type === 'update') ? 'block' : 'none';
    },

    async submitAction(originalId, safeId) {
        const field = document.getElementById(`field-${safeId}`);
        const action = field.dataset.action;
        const password = document.getElementById(`pw-${safeId}`).value;
        const content = document.getElementById(`area-${safeId}`).value;
        const msg = document.getElementById(`msg-${safeId}`);

        try {
            const res = await fetch(this.config.apiUrl, {
                method: 'POST',
                body: JSON.stringify({ action, id: originalId, content, password })
            });
            const result = await res.json();
            if (result.status === 200) { this.render(1); }
            else { msg.innerText = "비밀번호가 틀렸습니다."; msg.style.display = "block"; }
        } catch (e) { msg.innerText = "오류 발생"; msg.style.display = "block"; }
    },

    // ❗ 5단위 페이지네이션 로직 수정
    renderPagination(total, current) {
        const totalPages = Math.ceil(total / this.config.pageSize);
        if (totalPages <= 1) { this.pageContainer.innerHTML = ''; return; }
        
        const pageGroup = 5; // 5개 단위
        const currentGroup = Math.ceil(current / pageGroup);
        const startPage = (currentGroup - 1) * pageGroup + 1;
        const endPage = Math.min(startPage + pageGroup - 1, totalPages);
        
        let html = '';
        
        // 이전 그룹 버튼
        if (startPage > 1) {
            html += `<button class="page-btn" onclick="changePage(${startPage - 1})"><</button>`;
        }
        
        // 숫자 버튼
        for (let i = startPage; i <= endPage; i++) {
            html += `<button class="page-btn ${i === current ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
        }
        
        // 다음 그룹 버튼
        if (endPage < totalPages) {
            html += `<button class="page-btn" onclick="changePage(${endPage + 1})">></button>`;
        }
        
        this.pageContainer.innerHTML = html;
    }
};

window.CommentsModule = CommentsModule;
window.changePage = (p) => CommentsModule.render(p);
