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
            
            // 캐시 방지를 위해 타임스탬프 추가
            const url = `${this.config.apiUrl}?page=${page}&pageSize=${this.config.pageSize}&_=${new Date().getTime()}`;
            const res = await fetch(url);
            
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            
            const result = await res.json();
            
            // 데이터 추출 로직 강화: 로그를 찍어서 구조를 먼저 파악하세요.
            console.log("받은 데이터:", result); 

            // 결과가 배열이면 그대로 쓰고, 객체면 data 필드 확인, 둘 다 아니면 빈 배열
            let commentsData = [];
            if (Array.isArray(result)) {
                commentsData = result;
            } else if (result && Array.isArray(result.data)) {
                commentsData = result.data;
            } else if (result && typeof result === 'object') {
                // 가끔 API에서 객체 하나만 보낼 경우를 대비
                commentsData = result.id ? [result] : [];
            }

            const totalCount = result.total || commentsData.length;

            this.displayComments(commentsData);
            this.renderPagination(totalCount, page);
        } catch (e) {
            console.error("Comments Load Error:", e);
            // 사용자에게 더 구체적인 에러 메시지 노출
            this.listContainer.innerHTML = `
                <div style="text-align:center; padding:30px;">
                    <p>댓글을 불러올 수 없습니다.</p>
                    <small style="color:#ccc;">${e.message}</small>
                </div>`;
        }
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
