import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { moviesAPI, genresAPI, adminAPI, dictionaryAPI } from '../../../api/api';
import { useDataLoader } from '../../../hooks/useDataLoader';
import { AdminPageHeader } from '../../../components/AdminComponents/AdminComponents';
import './DashboardPage.css';
import RatingBadge from "../../../components/RatingBadge/RatingBadge";

/*  Иконки */
const PlusIcon = () => (
    <svg width="33" height="33" viewBox="0 0 24 24" fill="none"
         stroke="#7E7E7F" strokeWidth="5" strokeLinecap="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const FilmIcon = ({ size = 33, color = '#7E7E7F' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <rect x="2" y="2" width="20" height="20" rx="2" />
        <line x1="7" y1="2" x2="7" y2="22" />
        <line x1="17" y1="2" x2="17" y2="22" />
        <line x1="2" y1="12" x2="22" y2="12" />
    </svg>
);

const StarIcon = ({ size = 33, color = '#7E7E7F' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </svg>
);

const TagIcon = ({ size = 33, color = '#7E7E7F' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
);

const BookIcon = ({ size = 33, color = '#7E7E7F' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
        <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
    </svg>
);

/*  StatCard  */
const StatCard = ({ label, value, sublabel, icon }) => (
    <div className="dashboard__stat-card">
        <div className="dashboard__stat-info">
            <span className="dashboard__stat-label">{label}</span>
            <span className="dashboard__stat-value">{value}</span>
            <span className="dashboard__stat-sublabel">{sublabel}</span>
        </div>
        <div className="dashboard__stat-icon">{icon}</div>
    </div>
);

/*  Основной компонент  */
const DashboardPage = () => {
    const navigate = useNavigate();

    // 1. Базовые данные: фильмы и жанры (загружаются один раз)
    const baseQueries = useMemo(() => [
        {
            key: 'movies',
            fetcher: () => moviesAPI.getMovies({}),
            normalize: true,
            normalizeKeys: ['movies', 'items', 'data'],
        },
        {
            key: 'genres',
            fetcher: () => genresAPI.getGenres(),
            normalize: true,
            normalizeKeys: ['genres', 'items', 'data'],
        },
    ], []);

    const {
        movies,
        genres,
        isLoading: baseLoading,
        error: baseError,
        refetch: refetchBase,
    } = useDataLoader(baseQueries);

    // 2. Детальные данные: видеофайлы и слова (загружаются после получения movies)
    const [videoFiles, setVideoFiles] = useState([]);
    const [wordsCount, setWordsCount] = useState(0);
    const [detailsLoading, setDetailsLoading] = useState(false);

    useEffect(() => {
        if (!movies || movies.length === 0) return;

        const loadDetails = async () => {
            setDetailsLoading(true);
            try {
                // Для каждого фильма запрашиваем его видеофайлы и слова
                const videoPromises = movies.map(m =>
                    adminAPI.videoFiles
                        .getByMovie(m.movieId)
                        .then(res => res.data)
                        .catch(() => [])
                );
                const wordsPromises = movies.map(m =>
                    dictionaryAPI
                        .getMovieWords(m.movieId)
                        .then(res => res.data)
                        .catch(() => [])
                );

                const [videoArrays, wordsArrays] = await Promise.all([
                    Promise.all(videoPromises),
                    Promise.all(wordsPromises),
                ]);

                // Подсчёт общего количества
                const totalWords = wordsArrays.reduce((sum, arr) => sum + arr.length, 0);

                // Формируем плоский список видеофайлов с названием фильма
                const allVideos = videoArrays.flatMap((arr, idx) =>
                    arr.map(vf => ({
                        ...vf,
                        movieTitle: movies[idx]?.titleRu || movies[idx]?.titleOrig || '',
                    }))
                );

                setVideoFiles(allVideos);
                setWordsCount(totalWords);
            } catch (err) {
                console.error('Ошибка загрузки деталей:', err);
            } finally {
                setDetailsLoading(false);
            }
        };

        loadDetails();
    }, [movies]);

    const moviesArr = movies || [];
    const genresArr = genres || [];

    const totalMovies = moviesArr.length;
    const totalGenres = genresArr.length;
    const totalVideoFiles = videoFiles.length;

    const recentMovies = moviesArr.slice(0, 6);
    const recentVideos = videoFiles.slice(0, 3);

    const isLoading = baseLoading || detailsLoading;

    if (isLoading) {
        return (
            <div className="dashboard">
                <AdminPageHeader title="Дашборд" subtitle="Загрузка..." />
                <div className="dashboard__loading">Загрузка данных...</div>
            </div>
        );
    }

    if (baseError) {
        return (
            <div className="dashboard">
                <AdminPageHeader title="Дашборд" subtitle="Ошибка загрузки" />
                <div className="dashboard__error">
                    <p>Произошла ошибка: {baseError}</p>
                    <button onClick={refetchBase} className="dashboard__retry-btn">
                        Повторить попытку
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <AdminPageHeader
                title="Дашборд"
                subtitle="Добро пожаловать в панель управления"
            />

            {/* Статистика */}
            <div className="dashboard__stats">
                <StatCard
                    label="Фильмов"
                    value={totalMovies}
                    sublabel="в базе"
                    icon={<StarIcon />}
                />
                <StatCard
                    label="Видеофайлов"
                    value={totalVideoFiles}
                    sublabel="в базе"
                    icon={<FilmIcon />}
                />
                <StatCard
                    label="Жанров"
                    value={totalGenres}
                    sublabel="в базе"
                    icon={<TagIcon />}
                />
                <StatCard
                    label="Слов в словаре"
                    value={wordsCount}
                    sublabel="для изучения"
                    icon={<BookIcon />}
                />
            </div>

            {/* Нижняя панель */}
            <div className="dashboard__bottom">
                <div className="dashboard__panel dashboard__panel--movies">
                    <div className="dashboard__panel-header">
                        <h3 className="dashboard__panel-title">Последние фильмы</h3>
                        <button
                            className="dashboard__panel-btn"
                            onClick={() => navigate('/admin/movies')}
                        >
                            Все
                        </button>
                    </div>
                    <div className="dashboard__movies-list">
                        {recentMovies.length === 0 ? (
                            <p className="dashboard__empty">Нет фильмов</p>
                        ) : (
                            recentMovies.map(movie => (
                                <div key={movie.movieId} className="dashboard__movie-row">
                                    <div className="dashboard__movie-info">
                                        <div className="dashboard__movie-icon">
                                            <FilmIcon size={24} color="#D9D9D9" />
                                        </div>
                                        <div className="dashboard__movie-text">
                      <span className="dashboard__movie-title">
                        {movie.titleOrig || movie.titleRu || movie.title || '—'}
                      </span>
                                            <div className="dashboard__movie-meta">
                                                {movie.year && <span>{movie.year}</span>}
                                                {movie.duration && <span>{movie.duration} мин</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <RatingBadge
                                        rating={movie.kinopoiskRating}
                                        className="rating-badge"
                                    />
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="dashboard__right">
                    <div className="dashboard__panel dashboard__panel--actions">
                        <h3 className="dashboard__panel-title">Быстрые действия</h3>
                        <div className="dashboard__actions-grid">
                            <button
                                className="dashboard__action-card"
                                onClick={() => navigate('/admin/movies/add')}
                            >
                                <PlusIcon />
                                <span>Добавить фильм</span>
                            </button>
                            <button
                                className="dashboard__action-card"
                                onClick={() => navigate('/admin/video-files')}
                            >
                                <FilmIcon />
                                <span>Загрузить видео</span>
                            </button>
                            <button
                                className="dashboard__action-card"
                                onClick={() => navigate('/admin/genres')}
                            >
                                <TagIcon />
                                <span>Добавить жанр</span>
                            </button>
                            <button
                                className="dashboard__action-card"
                                onClick={() => navigate('/admin/dictionary')}
                            >
                                <BookIcon />
                                <span>Пополнить словарь</span>
                            </button>
                        </div>
                    </div>

                    <div className="dashboard__panel dashboard__panel--files">
                        <h3 className="dashboard__panel-title">Видеофайлы</h3>
                        <div className="dashboard__files-list">
                            {recentVideos.length === 0 ? (
                                <p className="dashboard__empty">Нет файлов</p>
                            ) : (
                                recentVideos.map((vf, i) => (
                                    <div key={vf.videoFileId || i} className="dashboard__file-row">
                    <span className="dashboard__file-name">
                      {vf.fileName ||
                          vf.videoPath?.split('/').pop() ||
                          vf.filePath?.split('/').pop() ||
                          'file.mp4'}
                    </span>
                                        <div className="dashboard__file-meta">
                                            <span>{vf.quality || '360p'}</span>
                                            <span>{vf.fileSize || vf.size || ''}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;