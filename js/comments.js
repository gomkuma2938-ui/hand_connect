export const CommentsModule = {
  config: {
    apiUrl: 'YOUR_GAS_WEB_APP_URL', // 배포 후 받은 URL 입력
    masterPw: '8124'
  },

  async init(containerId) {
    this.container = document.getElementById(containerId);
    this.currentPage = 1;
    await this.render();
  },

  async fetchComments(page) {
    const response = await fetch(`${this.config.apiUrl}?page=${page}`);
    return await response.json();
  },

  async postComment(content, password) {
    const res = await fetch(this.config.apiUrl, {
      method: 'POST',
      body: JSON.stringify({ action: 'create', content, password })
    });
    return await res.json();
  },

  async deleteComment(id, password) {
    const res = await fetch(this.config.apiUrl, {
      method: 'POST',
      body: JSON.stringify({ action: 'delete', id, password })
    });
    return await res.json();
  },

  async render(page = 1) {
    this.currentPage = page;
    const { data, total, pageSize } = await this.fetchComments(page);
    
    // UI 렌더링 로직 (비밀번호 불일치 시 붉은 문구 피드백 포함)
    // ... (상세 DOM 생성 로직)
  }
};
