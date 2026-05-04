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
        try {
            this.listContainer.innerHTML = '<div class="spinner-container"><div class="spinner"></div></div>';
            const res = await fetch(`${this.config.apiUrl}?page=${page}&pageSize=${this.config.pageSize}`);
            const result = await res.json();
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
        // 1. 소제목 위치 및 중앙 정렬 스타일 적용
        let html = `<h3 class="comments-title" style="text-align: center; margin-bottom: 20px;">기도 동참하기🙏</h3>`;

        if (!comments || comments.length === 0) {
            this.listContainer.innerHTML = html + '<p style="text-align:center; padding:30px; color:#999;">첫 댓글을 남겨주세요.</p>';
            return;
        }

        html += comments.map(c => {
            const idStr = String(c.id);
            const safeId = idStr.replace(/[^a-zA-Z0-9]/g, "");
            // 2. 실제 등록일시(timestamp) 출력
            const displayDate = c.timestamp || '방금 전'; 

            return `
                <div class="comment-item">
                    <div class="comment-content">${c.content}</div>
                    <div class="comment-footer">
                        <span class="comment-date">${displayDate}</span>
                        <div class="btn-group">
                            <button class="edit-btn" data-id="${idStr}" data-action="update">수정</button>
                            <button class="del-btn" data-id="${idStr}" data-action="delete">삭제</button>
                        </div>
                    </div>
                    <div id="action-area-${safeId}" class="edit-field-container" style="display:none;">
                        <textarea id="edit-input-${safeId}" class="edit-textarea">${c.content}</textarea>
                        <div class="edit-form-bottom">
                            <input type="password" id="action-pw-${safeId}" placeholder="비밀번호" class="edit-pw-input">
                            <div class="edit-btns">
                                <button id="action-submit-${safeId}" class="submit-edit-btn">확인</button>
                                <button class="cancel-btn" data-id="${idStr}">취소</button>
                            </div>
                        </div>
                        <!-- 7. 얼럿 대신 아래에 띄울 경고 문구 영역 (CSS 규격에 맞게 display 제어) -->
                        <div id="action-msg-${safeId}" class="error-msg" style="display:none; font-size:11px; color:red; margin-top:5px; text-align:center;"></div>
                    </div>
                </div>
            `;
        }).join('');
        this.listContainer.innerHTML = html;
        this.bindEvents();
    },

    async submitAction(id, action) {
        const safeId = id.replace(/[^a-zA-Z0-9]/g, "");
        const password = document.getElementById(`action-pw-${safeId}`).value;
        const content = action === 'update' ? document.getElementById(`edit-input-${safeId}`).value : "";
        const msgArea = document.getElementById(`action-msg-${safeId}`);
        
        // 에러 초기화
        msgArea.style.display = "none";
        msgArea.innerText = "";

        if (!password) {
            msgArea.innerText = "비밀번호를 입력해주세요.";
            msgArea.style.display = "block";
            return;
        }

        try {
            const res = await fetch(this.config.apiUrl, {
                method: 'POST',
                body: JSON.stringify({ action, id, content, password })
            });
            const result = await res.json();
            if (result.status === 200) {
                this.cache = {}; 
                this.render(1);
            } else {
                // 얼럿 대신 인라인 경고 문구 노출
                msgArea.innerText = "비밀번호가 일치하지 않습니다.";
                msgArea.style.display = "block";
            }
        } catch (e) { 
            msgArea.innerText = "통신 오류가 발생했습니다.";
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

window.changePage = (p) => CommentsModule.render(p);
