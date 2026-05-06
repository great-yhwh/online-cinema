import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { historyAPI, moviesAPI, STATIC_URL } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import './ContinueWatchingPage.css';

const ContinueWatchingPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [watchHistory, setWatchHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/');
            return;
        }
        loadHistory();
    }, [isAuthenticated, navigate]);

    const loadHistory = async () => {
        setLoading(true);
        try {
            const historyRes = await historyAPI.getHistory();
            const history = historyRes.data || [];

            // Фильтруем только незавершённые
            const inProgress = history.filter(h => !h.completed && h.progressTime > 0);

            // Загружаем данные о фильмах
            const enriched = await Promise.all(
                inProgress.map(async (item) => {
                    try {
                        const movieRes = await moviesAPI.getMovie(item.movieId);
                        return {
                            ...item,
                            movie: movieRes.data
                        };
                    } catch {
                        return { ...item, movie: null };
                    }
                })
            );

            // Убираем записи без фильма, сортируем по дате (последние сверху)
            const valid = enriched
                .filter(item => item.movie)
                .sort((a, b) => new Date(b.watchedAt) - new Date(a.watchedAt));

            setWatchHistory(valid);
        } catch (err) {
            console.error('Failed to load history:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (movieId, e) => {
        e.stopPropagation();
        try {
            await historyAPI.removeFromHistory(movieId);
            setWatchHistory(prev => prev.filter(item => item.movieId !== movieId));
        } catch (err) {
            console.error('Failed to remove:', err);
        }
    };

    const getFullUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return `${STATIC_URL}${path}`;
    };

    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const formatRemaining = (progressTime, totalDuration) => {
        if (!totalDuration || !progressTime) return '';
        const remaining = (totalDuration * 60) - progressTime; // duration в минутах
        if (remaining <= 0) return '';
        const h = Math.floor(remaining / 3600);
        const m = Math.floor((remaining % 3600) / 60);
        if (h > 0) return `Осталось ${h} ч ${m} мин`;
        return `Осталось ${m} мин`;
    };

    const getProgress = (progressTime, totalDuration) => {
        if (!totalDuration || !progressTime) return 0;
        const totalSeconds = totalDuration * 60; // duration в минутах
        return Math.min((progressTime / totalSeconds) * 100, 100);
    };

    const getTimeAgo = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 4) return 'Только что';
        if (diffMins < 60) return `${diffMins} мин назад`;
        if (diffHours < 24) return `${diffHours} ч назад`;
        if (diffDays < 7) return `${diffDays} дн назад`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} нед назад`;
        return date.toLocaleDateString('ru-RU');
    };

    if (loading) {
        return (
            <div className="cw-page">
                <div className="cw-page__loading">
                    <div className="cw-page__spinner" />
                    <p>Загрузка...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="cw-page">
            <div className="cw-page__container">
                <header className="cw-page__header">
                    <h1 className="cw-page__title">Продолжить просмотр</h1>
                    {watchHistory.length > 0 && (
                        <span className="cw-page__count">
                            {watchHistory.length} {watchHistory.length === 1 ? 'фильм' :
                            watchHistory.length < 5 ? 'фильма' : 'фильмов'}
                        </span>
                    )}
                </header>

                {watchHistory.length === 0 ? (
                    <div className="cw-page__empty">
                        <div className="cw-page__empty-icon">
                            <svg width="80" height="80" viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="4" width="20" height="16" rx="2" />
                                <path d="M10 9l5 3-5 3V9z" />
                            </svg>
                        </div>
                        <h2 className="cw-page__empty-title">Нет незавершённых просмотров</h2>
                        <p className="cw-page__empty-text">
                            Начните смотреть фильм — он появится здесь, чтобы вы могли продолжить в любой момент
                        </p>
                        <button
                            className="cw-page__empty-btn"
                            onClick={() => navigate('/catalog')}
                        >
                            Перейти к каталогу
                        </button>
                    </div>
                ) : (
                    <div className="cw-page__list">
                        {watchHistory.map((item) => {
                            const movie = item.movie;
                            const progressPercent = getProgress(item.progressTime, movie.duration);
                            const posterUrl = movie.posterPath ? getFullUrl(movie.posterPath) : null;

                            return (
                                <div
                                    key={item.movieId}
                                    className="cw-card"
                                    onClick={() => navigate(`/watch/${item.movieId}`)}
                                >
                                    {/* Постер / Превью */}
                                    <div className="cw-card__poster">
                                        {posterUrl ? (
                                            <img
                                                src={posterUrl}
                                                alt={movie.titleRu || movie.titleOrig}
                                                className="cw-card__poster-img"
                                            />
                                        ) : (
                                            <div className="cw-card__poster-placeholder">
                                                <svg width="40" height="40" viewBox="0 0 24 24"
                                                     fill="none" stroke="currentColor" strokeWidth="1.5">
                                                    <rect x="2" y="4" width="20" height="16" rx="2" />
                                                    <path d="M10 9l5 3-5 3V9z" />
                                                </svg>
                                            </div>
                                        )}

                                        {/* Оверлей с кнопкой Play */}
                                        <div className="cw-card__play-overlay">
                                            <div className="cw-card__play-btn">
                                                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M8 5v14l11-7z" />
                                                </svg>
                                            </div>
                                        </div>

                                        {/* Прогресс-бар на постере */}
                                        <div className="cw-card__progress-bar">
                                            <div
                                                className="cw-card__progress-fill"
                                                style={{ width: `${progressPercent}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Информация */}
                                    <div className="cw-card__info">
                                        <div className="cw-card__info-top">
                                            <h3 className="cw-card__title">
                                                {movie.titleRu || movie.titleOrig}
                                            </h3>
                                            {movie.titleOrig && movie.titleRu && (
                                                <p className="cw-card__title-orig">{movie.titleOrig}</p>
                                            )}
                                        </div>

                                        <div className="cw-card__meta">
                                            <span className="cw-card__year">{movie.year}</span>
                                            {movie.duration && (
                                                <span className="cw-card__duration">{movie.duration} мин</span>
                                            )}
                                            {movie.genres && movie.genres.length > 0 && (
                                                <span className="cw-card__genres">
                                                    {movie.genres.slice(0, 2).join(', ')}
                                                </span>
                                            )}
                                        </div>

                                        <div className="cw-card__progress-info">
                                            <div className="cw-card__time-info">
                                                <svg width="14" height="14" viewBox="0 0 24 24"
                                                     fill="none" stroke="currentColor" strokeWidth="2">
                                                    <circle cx="12" cy="12" r="10" />
                                                    <path d="M12 6v6l4 2" />
                                                </svg>
                                                <span>Остановились на {formatTime(item.progressTime)}</span>
                                            </div>
                                            <span className="cw-card__remaining">
                                                {formatRemaining(item.progressTime, movie.duration)}
                                            </span>
                                        </div>

                                        <div className="cw-card__bottom-row">
                                            <span className="cw-card__watched-ago">
                                                {getTimeAgo(item.watchedAt)}
                                            </span>
                                            <button
                                                className="cw-card__remove-btn"
                                                onClick={(e) => handleRemove(item.movieId, e)}
                                                title="Убрать из списка"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24"
                                                     fill="none" stroke="currentColor" strokeWidth="2"
                                                     strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M18 6L6 18M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContinueWatchingPage;