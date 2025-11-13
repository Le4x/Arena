import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('arena_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (email: string, password: string, name: string, role?: string) =>
    api.post('/auth/register', { email, password, name, role }),
  getProfile: () => api.get('/auth/me'),
};

// Game API
export const gameAPI = {
  createGame: (showId: string) => api.post('/games', { showId }),
  getGameByPin: (pinCode: string) => api.get(`/games/pin/${pinCode}`),
  getGame: (id: string) => api.get(`/games/${id}`),
  startGame: (id: string) => api.patch(`/games/${id}/start`),
  pauseGame: (id: string) => api.patch(`/games/${id}/pause`),
  finishGame: (id: string) => api.patch(`/games/${id}/finish`),
  setCurrentQuestion: (id: string, roundId: string, questionId: string) =>
    api.patch(`/games/${id}/question`, { roundId, questionId }),
  unlockBuzzer: (id: string) => api.post(`/games/${id}/buzzer/unlock`),
  lockBuzzer: (id: string) => api.post(`/games/${id}/buzzer/lock`),
  getBuzzerOrder: (questionId: string) =>
    api.get(`/games/question/${questionId}/buzzer-order`),
  getAnswers: (questionId: string) =>
    api.get(`/games/question/${questionId}/answers`),
  validateAnswer: (answerId: string, status: string, customPoints?: number) =>
    api.patch(`/games/answer/${answerId}/validate`, { status, customPoints }),
  autoValidateQCM: (questionId: string) =>
    api.post(`/games/question/${questionId}/auto-validate`),
};

// Team API
export const teamAPI = {
  createTeam: (gameId: string, name: string, color?: string, emoji?: string) =>
    api.post('/teams', { gameId, name, color, emoji }),
  getTeamsByGame: (gameId: string) => api.get(`/teams/game/${gameId}`),
  getLeaderboard: (gameId: string, limit?: number) =>
    api.get(`/teams/game/${gameId}/leaderboard`, { params: { limit } }),
  getTeam: (id: string) => api.get(`/teams/${id}`),
  addPlayer: (teamId: string, nickname: string, deviceId?: string) =>
    api.post(`/teams/${teamId}/player`, { nickname, deviceId }),
  updateScore: (teamId: string, points: number) =>
    api.patch(`/teams/${teamId}/score`, { points }),
  setScore: (teamId: string, score: number) =>
    api.patch(`/teams/${teamId}/score/set`, { score }),
  buzz: (teamId: string, questionId: string, gameId: string) =>
    api.post(`/teams/${teamId}/buzz/${questionId}`, { gameId }),
  submitAnswer: (
    teamId: string,
    questionId: string,
    payload: any,
    wasFirstToAnswer?: boolean
  ) =>
    api.post(`/teams/${teamId}/answer/${questionId}`, {
      payload,
      wasFirstToAnswer,
    }),
};

// Show API
export const showAPI = {
  getAllShows: () => api.get('/shows'),
  getShow: (id: string) => api.get(`/shows/${id}`),
  createShow: (data: any) => api.post('/shows', data),
  updateShow: (id: string, data: any) => api.put(`/shows/${id}`, data),
  deleteShow: (id: string) => api.delete(`/shows/${id}`),
  createRound: (showId: string, data: any) =>
    api.post(`/shows/${showId}/rounds`, data),
  createQuestion: (roundId: string, data: any) =>
    api.post(`/shows/rounds/${roundId}/questions`, data),
};
