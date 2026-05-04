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

            let commentsData = result.data || [];
            const totalCount = result.total || 0;

            this.displayComments(commentsData);
            this.renderPagination(totalCount, page);
        } catch (e) {
            this.listContainer.innerHTML = `<p style="text-align:center; padding:20px; color:#999;">댓글을 불러올 수 없습니다.</p>`;
        }
    },

    displayComments(data) {
        if (data.length === 0) {
            this.listContainer.innerHTML = '<p style="text-align:center; padding:40px; color:#999;">첫 번째 기도를 남겨주세요 🙏</p>';
            return;
        }

        this.listContainer.innerHTML = data.map(item => {
            // ID가 ISO날짜 형식이므로 특수문자 제거해서 DOM ID로 사용
            const safeId = String(item.id).replace(/[^a-zA-Z0-9]/g, "");
            // 보기 좋은 날짜 형식으로 변환 (예: 2023-10-27)
            const displayDate = item.id ? item.id.split('T')[0] : "";

            return `
                <div class="comment-item">
                    <div class="comment-content">${item.content.replace(/\n/g, '<br>')}</div>
                    <div class="comment-footer">
                        <span class="comment-date">${displayDate}</span>
                        <div class="btn-group">
                            <button class="edit-btn" onclick="CommentsModule.showAction('${safeId}', 'update')">수정</button>
                            <button class="del-btn" onclick="CommentsModule.showAction('${safeId}', 'delete')">삭제</button>
                        </div>
                    </div>
                    
                    <div id="action-field-${safeId}" class="edit-field-container" style="display:none;">
                        <textarea id="edit-input-${safeId}" class="edit-textarea" style="display:none;">${item.content}</textarea>
                        <div class="edit-form-bottom">
                            <input type="password" id="action-pw-${safeId}" class="edit-pw-input" placeholder="비밀번호">
                            <div class="edit-btns">
                                <button class="cancel-btn" onclick="CommentsModule.hideAction('${safeId}')">취소</button>
                                <button class="submit-edit-btn" onclick="CommentsModule.submitAction('${item.id}', '${safeId}')">확인</button>
                            </div>
                        </div>
                        <div id="action-msg-${safeId}" class="error-msg" style="display:none;"></div>
                    </div>
                </div>
            `;
        }).join('');
    },

    showAction(safeId, type) {
        this.hideAllActions();
        const field = document.getElementById(`action-field-${safeId}`);
        const input = document.getElementById(`edit-input-${safeId}`);
        field.dataset.type = type; // 현재 액션 저장 (update/delete)
        field.style.display = 'block';
        input.style.display = (type === 'update') ? 'block' : 'none';
    },

    hideAction(safeId) {
        document.getElementById(`action-field-${safeId}`).style.display = 'none';
    },

    hideAllActions() {
        document.querySelectorAll('.edit-field-container').forEach(el => el.style.display = 'none');
    },

    async submitAction(originalId, safeId) {
        const field = document.getElementById(`action-field-${safeId}`);
        const action = field.dataset.type; // 백엔드 action (update 또는 delete)
        const password = document.getElementById(`action-pw-${safeId}`).value;
        const content = document.getElementById(`edit-input-${safeId}`).value;
        const msgArea = document.getElementById(`action-msg-${safeId}`);

        if (!password) {
            msgArea.innerText = "비밀번호를 입력하세요.";
            msgArea.style.display = "block";
            return;
        }

        try {
            // 백엔드 doPost 구조에 맞게 전달
            const res = await fetch(this.config.apiUrl, {
                method: 'POST',
                mode: 'no-cors', // GAS 특성상 응답 확인이 필요하면 아래 logic 참고
                body: JSON.stringify({ 
                    action: action, 
                    id: originalId, 
                    content: content, 
                    password: password 
                })
            });

            // GAS doPost는 'no-cors' 이슈가 있을 수 있어 일반 fetch 후 결과 확인
            // 여기서는 단순화하여 2초 뒤 새로고침 (가장 확실한 방법)
            msgArea.style.color = "blue";
            msgArea.innerText = "처리 중...";
            msgArea.style.display = "block";
            
            setTimeout(() => this.render(1), 1500);

        } catch (e) {
            msgArea.innerText = "오류가 발생했습니다.";
            msgArea.style.display = "block";
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
