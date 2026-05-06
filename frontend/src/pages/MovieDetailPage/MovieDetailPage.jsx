import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    moviesAPI,
    favoritesAPI,
    historyAPI,
    dictionaryAPI,
    STATIC_URL,
} from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import './MovieDetailPage.css';
import RatingBadge from '../../components/RatingBadge/RatingBadge';

const MovieDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [movie, setMovie] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isWatched, setIsWatched] = useState(false);
    const [movieWords, setMovieWords] = useState([]);

    // Разделяем загрузку фильма и пользовательских данных
    const [movieLoading, setMovieLoading] = useState(true);
    const [userDataLoading, setUserDataLoading] = useState(false);

    const [leftColor, setLeftColor] = useState('#1a1a1a');
    const [rightColor, setRightColor] = useState('#1a1a1a');

    const canvasRef = useRef(null);
    const imgRef = useRef(null);

    // 1. Загрузка фильма — только при смене id
    useEffect(() => {
        let cancelled = false;

        const loadMovie = async () => {
            setMovieLoading(true);
            setMovie(null);
            try {
                const res = await moviesAPI.getMovie(id);
                if (!cancelled) {
                    setMovie(res.data);
                }
            } catch (err) {
                console.error('Failed to load movie:', err);
            } finally {
                if (!cancelled) {
                    setMovieLoading(false);
                }
            }
        };

        loadMovie();

        return () => {
            cancelled = true;
        };
    }, [id]);

    // 2. Загрузка пользовательских данных — при смене id или статуса авторизации
    useEffect(() => {
        if (!isAuthenticated) {
            // Сбрасываем пользовательские данные при выходе
            setIsFavorite(false);
            setIsWatched(false);
            setMovieWords([]);
            return;
        }

        let cancelled = false;

        const loadUserData = async () => {
            setUserDataLoading(true);
            try {
                const [favRes, wordsRes] = await Promise.allSettled([
                    favoritesAPI.checkFavorite(id),
                    dictionaryAPI.getMovieWords(id),
                ]);

                if (cancelled) return;

                if (favRes.status === 'fulfilled') {
                    setIsFavorite(favRes.value.data ?? false);
                }

                if (wordsRes.status === 'fulfilled') {
                    setMovieWords(wordsRes.value.data ?? []);
                }
            } catch (err) {
                console.error('Failed to load user data:', err);
            } finally {
                if (!cancelled) {
                    setUserDataLoading(false);
                }
            }
        };

        loadUserData();

        return () => {
            cancelled = true;
        };
    }, [id, isAuthenticated]);

    const getPosterUrl = () => {
        if (!movie?.posterPath) return null;
        if (movie.posterPath.startsWith('http')) return movie.posterPath;
        return `${STATIC_URL}${movie.posterPath}`;
    };

    const averageColor = (pixels) => {
        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < pixels.length; i += 4) {
            r += pixels[i];
            g += pixels[i + 1];
            b += pixels[i + 2];
            count++;
        }
        return {
            r: Math.round(r / count),
            g: Math.round(g / count),
            b: Math.round(b / count),
        };
    };

    const extractEdgeColors = () => {
        const canvas = canvasRef.current;
        const img = imgRef.current;
        if (!canvas || !img || !img.complete) return;

        const ctx = canvas.getContext('2d');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);

        const centerY = Math.floor(canvas.height / 2);
        const leftPixels = ctx.getImageData(0, centerY - 5, 3, 10).data;
        const rightPixels = ctx.getImageData(canvas.width - 3, centerY - 5, 3, 10).data;
        const leftAvg = averageColor(leftPixels);
        const rightAvg = averageColor(rightPixels);

        setLeftColor(`rgb(${leftAvg.r}, ${leftAvg.g}, ${leftAvg.b})`);
        setRightColor(`rgb(${rightAvg.r}, ${rightAvg.g}, ${rightAvg.b})`);
    };

    const toggleFavorite = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        try {
            if (isFavorite) {
                await favoritesAPI.removeFavorite(id);
                setIsFavorite(false);
            } else {
                await favoritesAPI.addFavorite(id);
                setIsFavorite(true);
            }
        } catch (err) {
            console.error('Failed to toggle favorite:', err);
        }
    };

    const toggleWatched = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        const newState = !isWatched;
        setIsWatched(newState);
        try {
            await historyAPI.updateProgress(movie.movieId, 0, newState);
        } catch (err) {
            console.error('Failed to toggle watched:', err);
            setIsWatched(!newState);
        }
    };

    const toggleWord = async (wordId, isInDictionary) => {
        if (!isAuthenticated) return;
        try {
            if (isInDictionary) {
                await dictionaryAPI.removeWord(wordId);
            } else {
                await dictionaryAPI.addWord(wordId);
            }
            setMovieWords((prev) =>
                prev.map((w) =>
                    w.wordId === wordId
                        ? { ...w, isInUserDictionary: !isInDictionary }
                        : w
                )
            );
        } catch (err) {
            console.error('Failed to toggle word:', err);
        }
    };

    if (movieLoading) {
        return (
            <div className="movie-detail-page">
                <div className="movie-detail-page__loading">
                    <div className="movie-detail-page__spinner" />
                </div>
            </div>
        );
    }

    if (!movie) {
        return (
            <div className="movie-detail-page">
                <div className="movie-detail-page__error">
                    <p>Фильм не найден</p>
                </div>
            </div>
        );
    }

    const posterUrl = getPosterUrl();

    const wordRows = [];
    for (let i = 0; i < movieWords.length; i += 3) {
        wordRows.push(movieWords.slice(i, i + 3));
    }

    return (
        <div className="movie-detail-page">
            {/* ===== ПЕРВЫЙ СКРИН: Постер + Кнопки ===== */}
            <section className="movie-detail-page__hero">
                {posterUrl && (
                    <div className="movie-detail-page__hero-bg">
                        <div
                            className="movie-detail-page__hero-bg-left"
                            style={{
                                background: `linear-gradient(to right, ${leftColor} 0%, ${rightColor} 5%, ${rightColor} 20%, ${leftColor} 60%, transparent 100%)`,
                            }}
                        />
                        <img
                            ref={imgRef}
                            className="movie-detail-page__hero-bg-image"
                            src={posterUrl}
                            alt=""
                            crossOrigin="anonymous"
                            onLoad={extractEdgeColors}
                        />
                        <div
                            className="movie-detail-page__hero-bg-right"
                            style={{
                                background: `linear-gradient(to left, ${rightColor} 0%, ${rightColor} 5%, ${rightColor} 20%, ${rightColor} 60%, ${rightColor} 75%, transparent 100%)`,
                            }}
                        />
                        <canvas
                            ref={canvasRef}
                            className="movie-detail-page__color-canvas"
                        />
                    </div>
                )}

                <div className="movie-detail-page__hero-content">
                    <div className="movie-detail-page__hero-left">
                        <div className="movie-detail-page__title-block">
                            <RatingBadge rating={movie.kinopoiskRating} />
                            <h1 className="movie-detail-page__title">
                                {movie.titleRu || movie.titleOrig}
                            </h1>
                            <p className="movie-detail-page__meta">
                                {movie.year}{' '}
                                {movie.genres?.join(', ').toLowerCase()}
                            </p>
                        </div>
                        <button
                            className="movie-detail-page__watch-btn"
                            onClick={() => navigate(`/watch/${movie.movieId}`)}
                        >
                            <svg
                                width="44"
                                height="44"
                                viewBox="0 0 24 24"
                                fill="#1E1E1E"
                                stroke="none"
                                strokeWidth="4"
                            >
                                <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                            <div>
                                <div className="movie-detail-page__watch-title">
                                    Смотреть фильм
                                </div>
                                <div className="movie-detail-page__watch-subtitle">
                                    с двойными субтитрами
                                </div>
                            </div>
                        </button>
                    </div>

                    <div className="movie-detail-page__actions">
                        <div className="movie-detail-page__action">
                            <div className="movie-detail-page__action-label">
                                {isFavorite ? 'В избранном' : 'Добавить в избранные'}
                            </div>
                            <button
                                className={`movie-detail-page__action-btn ${isFavorite ? 'movie-detail-page__action-btn--active' : ''}`}
                                onClick={toggleFavorite}
                            >
                                {isFavorite ? (
                                    <svg
                                        width="48"
                                        height="48"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        strokeWidth="1"
                                    >
                                        <path
                                            d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
                                            stroke="#1E1E1E"
                                            fill="none"
                                        />
                                    </svg>
                                ) : (
                                    <svg
                                        width="28"
                                        height="36"
                                        viewBox="0 0 29 37"
                                        fill="none"
                                    >
                                        <path
                                            d="M14.5 9.83333V14.5M14.5 14.5V19.1667M14.5 14.5H9.83333M14.5 14.5H19.1667M28.5 36.5L14.5 26.5L0.5 36.5V4.5C0.5 3.43913 0.921427 2.42172 1.67157 1.67157C2.42172 0.921427 3.43913 0.5 4.5 0.5H24.5C25.5609 0.5 26.5783 0.921427 27.3284 1.67157C28.0786 2.42172 28.5 3.43913 28.5 4.5V36.5Z"
                                            stroke="#FFFFFF"
                                            fill="none"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                )}
                            </button>
                        </div>

                        <div className="movie-detail-page__action">
                            <div className="movie-detail-page__action-label">
                                {isWatched
                                    ? 'Просмотрено'
                                    : 'Отметить просмотренным'}
                            </div>
                            <button
                                className={`movie-detail-page__action-btn ${isWatched ? 'movie-detail-page__action-btn--active' : ''}`}
                                onClick={toggleWatched}
                            >
                                <svg
                                    width="32"
                                    height="32"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    strokeWidth="1.5"
                                >
                                    <path
                                        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                                        stroke={isWatched ? '#1E1E1E' : '#FFFFFF'}
                                    />
                                    <circle
                                        cx="12"
                                        cy="12"
                                        r="3"
                                        stroke={isWatched ? '#1E1E1E' : '#FFFFFF'}
                                        fill={isWatched ? '#1E1E1E' : 'none'}
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== ВТОРОЙ СКРИН: Словарь ===== */}
            {isAuthenticated && (
                <section className="movie-detail-page__dictionary">
                    <div className="movie-detail-page__dictionary-header">
                        <h2>Словарь Видео</h2>
                        <p>Слова и выражения из видео для изучения</p>
                    </div>

                    {userDataLoading ? (
                        // Показываем скелетон вместо пустого состояния
                        // пока слова грузятся
                        <div className="movie-detail-page__words-skeleton">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="movie-detail-page__word-skeleton"
                                />
                            ))}
                        </div>
                    ) : movieWords.length === 0 ? (
                        <div className="movie-detail-page__empty">
                            <p>Словарь для этого фильма пока не добавлен</p>
                        </div>
                    ) : (
                        <div className="movie-detail-page__words">
                            {wordRows.map((row, rowIndex) => (
                                <div
                                    key={rowIndex}
                                    className="movie-detail-page__words-row"
                                >
                                    {row.map((word) => (
                                        <div
                                            key={word.wordId}
                                            className="movie-detail-page__word"
                                        >
                                            <button
                                                className={`movie-detail-page__word-add-btn ${word.isInUserDictionary ? 'movie-detail-page__word-add-btn--active' : ''}`}
                                                onClick={() =>
                                                    toggleWord(
                                                        word.wordId,
                                                        word.isInUserDictionary
                                                    )
                                                }
                                            >
                                                <svg
                                                    width="40"
                                                    height="40"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    strokeWidth="2"
                                                >
                                                    {word.isInUserDictionary ? (
                                                        <line
                                                            x1="5"
                                                            y1="12"
                                                            x2="19"
                                                            y2="12"
                                                            stroke="#1E1E1E"
                                                        />
                                                    ) : (
                                                        <>
                                                            <line
                                                                x1="12"
                                                                y1="5"
                                                                x2="12"
                                                                y2="19"
                                                                stroke="#FFFFFF"
                                                            />
                                                            <line
                                                                x1="5"
                                                                y1="12"
                                                                x2="19"
                                                                y2="12"
                                                                stroke="#FFFFFF"
                                                            />
                                                        </>
                                                    )}
                                                </svg>
                                            </button>
                                            <div className="movie-detail-page__word-content">
                                                <span className="movie-detail-page__word-orig">
                                                    {word.wordOriginal}
                                                </span>
                                                <svg
                                                    width="33"
                                                    height="27"
                                                    viewBox="0 0 12 2"
                                                    fill="none"
                                                >
                                                    <line
                                                        x1="0"
                                                        y1="1"
                                                        x2="12"
                                                        y2="1"
                                                        stroke="#FFFFFF"
                                                        strokeWidth="1.6"
                                                    />
                                                </svg>
                                                <span className="movie-detail-page__word-trans">
                                                    {word.translation}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            )}

            {/* ===== ТРЕТИЙ СКРИН: О фильме ===== */}
            <section className="movie-detail-page__about">
                <h3 className="movie-detail-page__about-title">О фильме</h3>

                <div className="movie-detail-page__about-content">
                    <div className="movie-detail-page__descriptions">
                        {movie.describeRu && <p>{movie.describeRu}</p>}
                        {movie.describeEng && <p>{movie.describeEng}</p>}
                    </div>

                    <div className="movie-detail-page__info">
                        <div className="movie-detail-page__info-col">
                            <div className="movie-detail-page__info-item">
                                <h4>Оригинальное название</h4>
                                <p>{movie.titleOrig}</p>
                            </div>
                            <div className="movie-detail-page__info-item">
                                <h4>Жанры</h4>
                                <p>
                                    {movie.genres?.join(', ').toLowerCase()}
                                </p>
                            </div>
                            <div className="movie-detail-page__info-item">
                                <h4>Субтитры</h4>
                                <p>
                                    {movie.subtitles?.length > 0
                                        ? movie.subtitles
                                            .map((s) => s.languageCode)
                                            .join(', ')
                                            .toUpperCase()
                                        : '—'}
                                </p>
                            </div>
                            <div className="movie-detail-page__info-item">
                                <h4>Кинопоиск</h4>
                                <p>{movie.kinopoiskRating || '—'}</p>
                            </div>
                        </div>

                        <div className="movie-detail-page__info-col">
                            <div className="movie-detail-page__info-item">
                                <h4>Русское название</h4>
                                <p>{movie.titleRu || '—'}</p>
                            </div>
                            <div className="movie-detail-page__info-item">
                                <h4>Длительность</h4>
                                <p>{movie.duration} минут</p>
                            </div>
                            <div className="movie-detail-page__info-item">
                                <h4>Страна</h4>
                                <p>{movie.country}</p>
                            </div>
                            <div className="movie-detail-page__info-item">
                                <h4>Год</h4>
                                <p>{movie.year}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default MovieDetailPage;