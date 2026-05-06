import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,  //  httpOnly cookies автоматически
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Можно добавить логику
        }
        return Promise.reject(error);
    }
);

// Все эндпоинты без изменений
export const authAPI = {
    register: (login, password) =>
        api.post('/auth/register', { login, password }),
    login: (login, password) =>
        api.post('/auth/login', { login, password }),
    logout: () =>
        api.post('/auth/logout'),
    getMe: () =>
        api.get('/auth/me'),
};

export const moviesAPI = {
    getMovies: (params) => api.get('/movies', { params }),
    getMovie: (id) => api.get(`/movies/${id}`),
    getSimilar: (id, count = 5) =>
        api.get(`/movies/${id}/similar`, { params: { count } }),
};

export const genresAPI = {
    getGenres: () => api.get('/genres'),
};

export const favoritesAPI = {
    getFavorites: () => api.get('/favorites'),
    addFavorite: (movieId) => api.post(`/favorites/${movieId}`),
    removeFavorite: (movieId) => api.delete(`/favorites/${movieId}`),
    checkFavorite: (movieId) => api.get(`/favorites/${movieId}/check`),
};

export const historyAPI = {
    getHistory: () => api.get('/history'),
    updateProgress: (movieId, progressTime, completed) =>
        api.post('/history/progress', { movieId, progressTime, completed }),
    removeFromHistory: (movieId) => api.delete(`/history/${movieId}`),
    clearHistory: () => api.delete('/history'),
};

export const dictionaryAPI = {
    getMovieWords: (movieId) => api.get(`/dictionary/movie/${movieId}`),
    getMyDictionary: () => api.get('/dictionary/my'),
    addWord: (wordId) => api.post(`/dictionary/my/${wordId}`),
    removeWord: (wordId) => api.delete(`/dictionary/my/${wordId}`),
    getGameWords: (count = 10) =>
        api.get('/dictionary/game', { params: { count } }),
};

//                     Апи админ панели
export const adminAPI = {
    movies: {
        create: (data) => api.post('/admin/movies', data),
        get: (id) => api.get(`/admin/movies/${id}`), // ← добавить
        update: (id, data) => api.put(`/admin/movies/${id}`, data),
        delete: (id) => api.delete(`/admin/movies/${id}`),
    },
    genres: {
        create: (data) => api.post('/admin/genres', data),
        update: (id, data) => api.put(`/admin/genres/${id}`, data),
        delete: (id) => api.delete(`/admin/genres/${id}`),
    },
    subtitles: {
        create: (data) => api.post('/admin/subtitles', data),
        getByMovie: (movieId) => api.get(`/admin/movies/${movieId}/subtitles`),
        update: (id, data) => api.put(`/admin/subtitles/${id}`, data),
        delete: (id) => api.delete(`/admin/subtitles/${id}`),
    },
    videoFiles: {
        create: (data) => api.post('/admin/video-files', data),
        getByMovie: (movieId) => api.get(`/admin/movies/${movieId}/video-files`),
        update: (id, data) => api.put(`/admin/video-files/${id}`, data),
        delete: (id) => api.delete(`/admin/video-files/${id}`),
    },
    movieWords: {
        create: (data) => api.post('/admin/movie-words', data),
        bulkCreate: (movieId, words) =>
            api.post(`/admin/movies/${movieId}/words/bulk`, words),
        update: (id, data) => api.put(`/admin/movie-words/${id}`, data),
        delete: (id) => api.delete(`/admin/movie-words/${id}`),
        deleteAll: (movieId) => api.delete(`/admin/movies/${movieId}/words`),
    },
    users: {
        getAll: () => api.get('/admin/users'),
        changeRole: (userId, role) =>
            api.patch(`/admin/users/${userId}/role`, { role }),
        delete: (userId) => api.delete(`/admin/users/${userId}`),
    },
    upload: {
        poster: (file) => {
            const formData = new FormData();
            formData.append('file', file);
            return api.post('/admin/upload/poster', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        },
        video: (file, config = {}) => {
            const formData = new FormData();
            formData.append('file', file);
            return api.post('/admin/upload/video', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                ...config,
            });
        },
        subtitle: (file) => {
            const formData = new FormData();
            formData.append('file', file);
            return api.post('/admin/upload/subtitle', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        },
    },
};

export const STATIC_URL = process.env.REACT_APP_STATIC_URL;

export default api;