export const CommentsModule = {
    config: {
        apiUrl: 'https://script.google.com/macros/s/AKfycbyVKORhy8YN5vaWf6xIrikRjYwhodtfEQDdkpXvPALD-GIfXlW-kqOr81H_gvRfvXhg6g/exec',
        pageSize: 10
    },
    cache: {},

    async init(containerId) {
        this.listContainer = document.getElementById(containerId);
        this.pageContainer = document.getElementById('pagination');
        if (!this.listContainer) return;
        await this.render(1);
    },

    async render(page = 1) {
        // 로딩 안 되는 문제 해결을 위해 응답 구조 파악 로직 강화
        try {
            this.listContainer.innerHTML = '<div class="spinner-container"><div class="spinner"></div></div>';
            const res = await fetch(`${this.config.apiUrl}?page=${page}&pageSize=${this.config.pageSize}`);
            const result = await res.json();
            
            // 데이터 추출 (배열인지 객체인지에 따라 유연하게 대응)
            const commentsData = Array.isArray(result) ? result : (result.data || []);
            const totalCount = result.total || commentsData.length;

            this.displayComments(commentsData);
            this.renderPagination(totalCount, page);
        } catch (e) {
            console.error("Comments Load Error:", e);
            this.listContainer.innerHTML = '<p style="text-align:center; padding:30px;">댓글을 불러올 수 없습니다.</p>';
        }
    },

    displayComments(comments) {
        if (!comments || comments.length === 0) {
            this.listContainer.innerHTML = '<p style="text-align:center; padding:30px; color:#999;">첫 댓글을 남겨주세요.</p>';
            return;
        }

        // 보내주신 CSS (.comment-item) 규격에 맞춘 렌더링
        this.listContainer.innerHTML = comments.map(c => {
            const idStr = String(c.id);
            const safeId = idStr.replace(/[^a-zA-Z0-9]/g, "");
            return `
                <div class="comment-item">
                    <div class="comment-content">${c.content}</div>
                    <div class="comment-footer">
                        <span class="comment-date">기록됨</span>
                        <div class="btn-group">
                            <button class="edit-btn" data-id="${idStr}" data-action="update">수정</button>
                            <button class="del-btn" data-id="${idStr}" data-action="delete">삭제</button>
                        </div>
                    </div>
                    <!-- 인라인 수정/삭제 필드 -->
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

        this.bindEvents();
    },

    bindEvents() {
        this.listContainer.querySelectorAll('.edit-btn, .del-btn').forEach(btn => {
            btn.onclick = () => this.openActionField(btn.dataset.id, btn.dataset.action);
        });
        this.listContainer.querySelectorAll('.cancel-btn').forEach(btn => {
            btn.onclick = () => this.closeActionField(btn.dataset.id);
        });
    },

    openActionField(id, action) {
        const safeId = id.replace(/[^a-zA-Z0-9]/g, "");
        const area = document.getElementById(`action-area-${safeId}`);
        if (!area) return;
        
        area.style.display = 'block';
        const submitBtn = document.getElementById(`action-submit-${safeId}`);
        const input = document.getElementById(`edit-input-${safeId}`);
        
        if (action === 'delete') {
            if (input) input.style.display = 'none';
            submitBtn.innerText = '삭제';
        } else {
            if (input) input.style.display = 'block';
            submitBtn.innerText = '수정';
        }
        submitBtn.onclick = () => this.submitAction(id, action);
    },

    closeActionField(id) {
        const safeId = id.replace(/[^a-zA-Z0-9]/g, "");
        const area = document.getElementById(`action-area-${safeId}`);
        if (area) area.style.display = 'none';
    },

    async submitAction(id, action) {
        const safeId = id.replace(/[^a-zA-Z0-9]/g, "");
        const password = document.getElementById(`action-pw-${safeId}`).value;
        const content = action === 'update' ? document.getElementById(`edit-input-${safeId}`).value : "";
        
        if (!password) return alert("비밀번호를 입력하세요.");

        try {
            const res = await fetch(this.config.apiUrl, {
                method: 'POST',
                body: JSON.stringify({ action, id, content, password })
            });
            const result = await res.json();
            if (result.status === 200) {
                alert("완료되었습니다.");
                this.render(1);
            } else {
                alert("비밀번호가 일치하지 않습니다.");
            }
        } catch (e) { alert("통신 오류가 발생했습니다."); }
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

window.changePage = (p) => CommentsModule.render(p);
