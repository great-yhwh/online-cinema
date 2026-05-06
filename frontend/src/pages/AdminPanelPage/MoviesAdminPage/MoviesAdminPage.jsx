import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { moviesAPI, adminAPI, genresAPI, dictionaryAPI } from '../../../api/api';
import { useDataLoader } from '../../../hooks/useDataLoader';
import {
    AdminPageHeader,
    AdminButton,
    TrashButton,
    EditButton,
    GenreTag,
} from '../../../components/AdminComponents/AdminComponents';
import './MoviesAdminPage.css';
import SortSelect from "../../../components/SortSelect/SortSelect";
import RatingBadge from "../../../components/RatingBadge/RatingBadge";
import SearchInput from "../../../components/SearchInput/SearchInput";

const MoviesAdminPage = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('rating');
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const [counters, setCounters] = useState({});
    const [countersLoading, setCountersLoading] = useState(false);

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
        movies: rawMovies,
        genres: rawGenres,
        isLoading: baseLoading,
        error: baseError,
        refetch: refetchBase,
    } = useDataLoader(baseQueries);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const movies = rawMovies || [];
    const genres = rawGenres || [];

    useEffect(() => {
        if (!movies.length) return;
        const loadCounters = async () => {
            setCountersLoading(true);
            try {
                const promises = movies.map(async (movie) => {
                    const [subsRes, wordsRes] = await Promise.allSettled([
                        adminAPI.subtitles.getByMovie(movie.movieId),
                        dictionaryAPI.getMovieWords(movie.movieId),
                    ]);
                    const subsCount = subsRes.status === 'fulfilled'
                        ? (Array.isArray(subsRes.value.data) ? subsRes.value.data.length : 0)
                        : 0;
                    const wordsCount = wordsRes.status === 'fulfilled'
                        ? (Array.isArray(wordsRes.value.data) ? wordsRes.value.data.length : 0)
                        : 0;
                    return { movieId: movie.movieId, subsCount, wordsCount };
                });
                const results = await Promise.all(promises);
                const countersMap = {};
                results.forEach(({ movieId, subsCount, wordsCount }) => {
                    countersMap[movieId] = { subsCount, wordsCount };
                });
                setCounters(countersMap);
            } catch (err) {
                console.error('Ошибка загрузки счётчиков:', err);
            } finally {
                setCountersLoading(false);
            }
        };
        loadCounters();
    }, [movies]);

    const handleDelete = async (movieId) => {
        try {
            await adminAPI.movies.delete(movieId);
            setDeleteConfirm(null);
            await refetchBase();
            setCounters({});
        } catch (err) {
            console.error('Delete error:', err);
            alert('Ошибка при удалении фильма');
        }
    };

    const getMovieGenres = (movie) => {
        // Случай 1: есть явный массив ID
        if (movie.genreIds && Array.isArray(movie.genreIds)) {
            return movie.genreIds
                .map(id => genres.find(g => g.genreId === id))
                .filter(Boolean);
        }

        // Случай 2: genres — массив объектов с полем genreId
        if (movie.genres && Array.isArray(movie.genres) && movie.genres.length > 0) {
            const first = movie.genres[0];
            if (typeof first === 'object' && first.genreId !== undefined) {
                return movie.genres.map(gObj => genres.find(g => g.genreId === gObj.genreId)).filter(Boolean);
            }
            // Случай 3: genres — массив объектов, но уже содержат name (без ID)
            if (typeof first === 'object' && first.name) {
                return movie.genres; // уже готовые жанры
            }
            // Случай 4: genres — массив чисел (ID)
            if (typeof first === 'number') {
                return movie.genres.map(id => genres.find(g => g.genreId === id)).filter(Boolean);
            }
            // Случай 5: genres — массив строк (названий)
            if (typeof first === 'string') {
                return movie.genres.map(name => ({ genreId: name, name })); // заглушка
            }
        }

        return [];
    };

    const filtered = useMemo(() => {
        if (!Array.isArray(movies)) return [];
        let result = movies.filter(m => {
            if (!search.trim()) return true;
            const q = search.toLowerCase();
            return (
                (m.titleRu || '').toLowerCase().includes(q) ||
                (m.titleEn || m.titleOrig || '').toLowerCase().includes(q) ||
                (m.title || '').toLowerCase().includes(q)
            );
        });

        if (sortBy === 'rating') {
            result.sort((a, b) => (b.rating || b.kinopoiskRating || 0) - (a.rating || a.kinopoiskRating || 0));
        } else if (sortBy === 'year') {
            result.sort((a, b) => (b.year || 0) - (a.year || 0));
        } else if (sortBy === 'title') {
            result.sort((a, b) => (a.titleRu || a.titleOrig || '').localeCompare(b.titleRu || b.titleOrig || ''));
        }
        return result;
    }, [movies, search, sortBy]);

    const isLoading = baseLoading || countersLoading;

    if (baseError) {
        return (
            <div className="movies-admin">
                <AdminPageHeader title="Все фильмы" subtitle="Ошибка" />
                <div className="movies-admin__error">
                    <p>Ошибка: {baseError}</p>
                    <button onClick={refetchBase}>Повторить</button>
                </div>
            </div>
        );
    }

    return (
        <div className="movies-admin">
            <div className="movies-admin__header-row">
                <AdminPageHeader
                    title="Все фильмы"
                    subtitle={`${filtered.length} фильм${
                        filtered.length === 1 ? '' : filtered.length < 5 && filtered.length > 1 ? 'а' : 'ов'
                    } в базе`}
                />
                <AdminButton onClick={() => navigate('/admin/movies/add')}>
                    Добавить фильм
                </AdminButton>
            </div>

            <div className="movies-admin__toolbar">
                <SearchInput
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Найти фильм, сериал..."
                    variant="admin"
                />
                <SortSelect currentSort={sortBy} onSortChange={setSortBy} />
            </div>

            {isLoading ? (
                <div className="movies-admin__loading">Загрузка...</div>
            ) : filtered.length === 0 ? (
                <div className="movies-admin__empty">
                    {search ? 'Фильмы не найдены' : 'Нет фильмов в базе'}
                </div>
            ) : (
                <div className="movies-admin__list">
                    {filtered.map(movie => {
                        const movieCounters = counters[movie.movieId] || { subsCount: 0, wordsCount: 0 };
                        return (
                            <div key={movie.movieId} className="movies-admin__row">
                                <div className="movies-admin__col movies-admin__col--title">
                                    <span className="movies-admin__col-header">Фильм</span>
                                    <div className="movies-admin__col-content">
                    <span className="movies-admin__title-en">
                      {movie.titleEn || movie.titleOrig || '—'}
                    </span>
                                        <span className="movies-admin__title-ru">
                      {movie.titleRu || '—'}
                    </span>
                                    </div>
                                </div>

                                <div className="movies-admin__col movies-admin__col--year">
                                    <span className="movies-admin__col-header">Год</span>
                                    <div className="movies-admin__col-content">
                                        <span className="movies-admin__value">{movie.year || '—'}</span>
                                    </div>
                                </div>

                                <div className="movies-admin__col movies-admin__col--genres">
                                    <span className="movies-admin__col-header">Жанры</span>
                                    <div className="movies-admin__col-content movies-admin__genres">
                                        {getMovieGenres(movie).slice(0, 3).map(g => (
                                            <GenreTag key={g.genreId} name={g.name} />
                                        ))}
                                    </div>
                                </div>

                                <div className="movies-admin__col movies-admin__col--rating">
                                    <span className="movies-admin__col-header">Рейтинг</span>
                                    <div className="movies-admin__rating-badge">
                                            <RatingBadge
                                            rating={movie.kinopoiskRating}
                                            className="rating-badge"
                                            />
                                    </div>
                                </div>

                                <div className="movies-admin__col movies-admin__col--subs">
                                    <span className="movies-admin__col-header">Субтитры</span>
                                    <div className="movies-admin__col-content">
                    <span className="movies-admin__value movies-admin__value--big">
                      {movieCounters.subsCount}
                    </span>
                                    </div>
                                </div>

                                <div className="movies-admin__col movies-admin__col--words">
                                    <span className="movies-admin__col-header">Слова</span>
                                    <div className="movies-admin__col-content">
                    <span className="movies-admin__value movies-admin__value--big">
                      {movieCounters.wordsCount}
                    </span>
                                    </div>
                                </div>

                                <div className="movies-admin__col movies-admin__col--actions">
                                    <span className="movies-admin__col-header">Действия</span>
                                    <div className="movies-admin__col-content movies-admin__actions">
                                        <EditButton onClick={() => navigate(`/admin/movies/edit/${movie.movieId}`)} />
                                        {deleteConfirm === movie.movieId ? (
                                            <div className="movies-admin__confirm">
                                                <button className="movies-admin__confirm-yes" onClick={() => handleDelete(movie.movieId)}>Да</button>
                                                <button className="movies-admin__confirm-no" onClick={() => setDeleteConfirm(null)}>Нет</button>
                                            </div>
                                        ) : (
                                            <TrashButton onClick={() => setDeleteConfirm(movie.movieId)} />
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MoviesAdminPage;