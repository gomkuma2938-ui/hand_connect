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

            // 백엔드 시트 구조에 맞게 데이터 추출
            let commentsData = result.data || [];
            const totalCount = result.total || 0;

            this.displayComments(commentsData);
            this.renderPagination(totalCount, page);
        } catch (e) {
            this.listContainer.innerHTML = `<p style="text-align:center; padding:20px;">댓글을 불러올 수 없습니다.</p>`;
        }
    },

    // 사용자님의 클래스명을 그대로 사용한 렌더링 함수
    displayComments(data) {
        if (data.length === 0) {
            this.listContainer.innerHTML = '<p style="text-align:center; padding:20px;">첫 기도를 남겨주세요.</p>';
            return;
        }

        this.listContainer.innerHTML = data.map(item => {
            const safeId = String(item.id).replace(/[^a-zA-Z0-9]/g, "");
            const displayDate = item.id ? item.id.split('T')[0] : "";

            return `
                <div class="comment-item">
                    <div class="comment-content">${item.content.replace(/\n/g, '<br>')}</div>
                    <div class="comment-footer">
                        <span class="comment-date">${displayDate}</span>
                        <div class="btn-group">
                            <!-- 사용자님 CSS의 edit-btn, del-btn 사용 -->
                            <button class="edit-btn" onclick="CommentsModule.toggleField('${safeId}', 'update')">수정</button>
                            <button class="del-btn" onclick="CommentsModule.toggleField('${safeId}', 'delete')">삭제</button>
                        </div>
                    </div>
                    
                    <!-- 사용자님 CSS의 edit-field-container 사용 -->
                    <div id="field-${safeId}" class="edit-field-container" style="display:none;">
                        <textarea id="area-${safeId}" class="edit-textarea" style="display:none;">${item.content}</textarea>
                        <div class="edit-form-bottom">
                            <input type="password" id="pw-${safeId}" class="edit-pw-input" placeholder="비번">
                            <div class="edit-btns">
                                <button class="cancel-btn" onclick="CommentsModule.toggleField('${safeId}')">취소</button>
                                <button class="submit-edit-btn" onclick="CommentsModule.submitAction('${item.id}', '${safeId}')">확인</button>
                            </div>
                        </div>
                        <div id="msg-${safeId}" class="error-msg" style="display:none;"></div>
                    </div>
                </div>
            `;
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
        const action = field.dataset.action; // update 또는 delete
        const password = document.getElementById(`pw-${safeId}`).value;
        const content = document.getElementById(`area-${safeId}`).value;
        const msg = document.getElementById(`msg-${safeId}`);

        try {
            const res = await fetch(this.config.apiUrl, {
                method: 'POST',
                body: JSON.stringify({ action, id: originalId, content, password })
            });
            const result = await res.json();

            if (result.status === 200) {
                this.render(1);
            } else {
                msg.innerText = "비밀번호가 틀렸습니다.";
                msg.style.display = "block";
            }
        } catch (e) {
            msg.innerText = "오류 발생";
            msg.style.display = "block";
        }
    },

    renderPagination(total, current) {
        const totalPages = Math.ceil(total / this.config.pageSize);
        if (totalPages <= 1) { this.pageContainer.innerHTML = ''; return; }
        let html = '';
        for (let i = 1; i <= totalPages; i++) {
            html += `<button class="page-btn ${i === current ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
        }
        this.pageContainer.innerHTML = html;
    }
};

window.CommentsModule = CommentsModule;
window.changePage = (p) => CommentsModule.render(p);
