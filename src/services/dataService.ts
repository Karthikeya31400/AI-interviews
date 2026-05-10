export const dataService = {
  async getInterviews(userId: string) {
    const response = await fetch(`/api/interviews?userId=${userId}`);
    if (!response.ok) throw new Error('Failed to fetch interviews');
    return await response.json();
  },

  async saveInterview(data: {
    userId: string;
    type: string;
    position: string;
    status: string;
    score: number;
    feedback: string;
    questions: string[];
    evaluation: any;
  }) {
    const response = await fetch('/api/interviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to save interview');
    return await response.json();
  },

  async getResumeAnalyses(userId: string) {
    const response = await fetch(`/api/resume-analyses?userId=${userId}`);
    if (!response.ok) throw new Error('Failed to fetch resume analyses');
    return await response.json();
  },

  async saveResumeAnalysis(data: {
    userId: string;
    fileName: string;
    analysis: any;
  }) {
    const response = await fetch('/api/resume-analyses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to save resume analysis');
    return await response.json();
  },

  async login(userData: {
    email: string;
    displayName?: string;
    photoURL?: string;
    uid?: string;
  }) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!response.ok) throw new Error('Login failed');
    return await response.json();
  },

  async getUser(uid: string) {
    const response = await fetch(`/api/users/${uid}`);
    if (!response.ok) throw new Error('User not found');
    return await response.json();
  },

  async getAllUsers() {
    const response = await fetch('/api/admin/users');
    if (!response.ok) throw new Error('Failed to fetch users');
    return await response.json();
  },

  async updateUserRole(uid: string, role: string) {
    const response = await fetch(`/api/admin/users/${uid}/role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    if (!response.ok) throw new Error('Failed to update role');
    return await response.json();
  }
};
