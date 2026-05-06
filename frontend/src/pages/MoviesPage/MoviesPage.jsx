import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { moviesAPI, genresAPI } from '../../api/api';
import MovieCard from '../../components/MovieCard/MovieCard';
import MovieFilter from '../../components/MovieFilter/MovieFilter';
import './MoviesPage.css';
import SortSelect from '../../components/SortSelect/SortSelect';


const MoviesPage = ({ isFilterOpen, setIsFilterOpen }) => {
    const [searchParams] = useSearchParams();

    const [movies, setMovies] = useState([]);
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);

    const [selectedGenres, setSelectedGenres] = useState([]);
    const [sortBy, setSortBy] = useState('rating');
    const [sortOrder, setSortOrder] = useState('desc');

    useEffect(() => {
        const genreId = searchParams.get('genreId');
        if (genreId) {
            setSelectedGenres([parseInt(genreId)]);
        }
        loadGenres();
    }, []);

    useEffect(() => {
        loadMovies();
    }, [currentPage, selectedGenres, sortBy, sortOrder, searchParams]);

    useEffect(() => {
        return () => {
            setIsFilterOpen(false);
        };
    }, [setIsFilterOpen]);

    const loadGenres = async () => {
        try {
            const res = await genresAPI.getGenres();
            setGenres(res.data || []);
        } catch (err) {
            console.error('Failed to load genres:', err);
        }
    };

    const loadMovies = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                pageSize: 10,
                sortBy,
                sortOrder,
            };

            if (selectedGenres.length > 0) {
                params.genreId = selectedGenres[0];
            }

            const query = searchParams.get('query');
            if (query) {
                params.query = query;
            }

            const res = await moviesAPI.getMovies(params);
            setMovies(res.data.items || []);
            setTotalPages(res.data.totalPages || 1);
        } catch (err) {
            console.error('Failed to load movies:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleGenreToggle = (genreId) => {
        setSelectedGenres((prev) =>
            prev.includes(genreId)
                ? prev.filter((id) => id !== genreId)
                : [...prev, genreId]
        );
        setCurrentPage(1);
    };

    const handleRemoveGenre = (genreId) => {
        setSelectedGenres((prev) => prev.filter((id) => id !== genreId));
        setCurrentPage(1);
    };

    const handleResetFilters = () => {
        setSelectedGenres([]);
        setSortBy('rating');
        setSortOrder('desc');
        setCurrentPage(1);
    };

    return (
        <div className={`movies-page ${isFilterOpen ? 'movies-page--filter-open' : ''}`}>
            <MovieFilter
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                genres={genres}
                selectedGenres={selectedGenres}
                onToggleGenre={handleGenreToggle}
                onReset={handleResetFilters}
                onApply={() => {}}
            />

            <div className="movies-page__main">
                {!isFilterOpen &&(<div className="movies-page__toolbar">
                    <div className="movies-page__toolbar-left">
                        <div className="movies-page__title-row">
                            <h1 className="movies-page__title">Фильмы</h1>

                            <button
                                className="movies-page__filter-btn"
                                onClick={() => setIsFilterOpen(true)}
                            >
                                <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M7 2a1 1 0 0 0-2 0v2.254c-.997.012-1.593.067-2.077.305A3 3 0 0 0 1.56 5.923C1.25 6.551 1.25 7.367 1.25 9s0 2.45.31 3.077a3 3 0 0 0 1.363 1.364c.627.309 1.444.309 3.077.309s2.45 0 3.077-.31a3 3 0 0 0 1.364-1.363c.309-.627.309-1.444.309-3.077s0-2.45-.31-3.077A3 3 0 0 0 9.078 4.56c-.484-.238-1.08-.293-2.077-.305V2Zm12 0a1 1 0 1 0-2 0v6a1 1 0 1 0 2 0V2ZM7 16a1 1 0 1 0-2 0v6a1 1 0 1 0 2 0v-6Zm10 3.746c-.997-.012-1.593-.067-2.077-.305a3 3 0 0 1-1.364-1.364c-.309-.628-.309-1.444-.309-3.077s0-2.45.31-3.077a3 3 0 0 1 1.363-1.364c.627-.309 1.444-.309 3.077-.309s2.45 0 3.077.31a3 3 0 0 1 1.364 1.363c.309.627.309 1.444.309 3.077s0 2.45-.31 3.077a3 3 0 0 1-1.363 1.364c-.484.238-1.08.293-2.077.305V22a1 1 0 1 1-2 0v-2.254Z"
                                        fill="#FFFFFF"
                                    />
                                </svg>
                                <span>Настройки поиска</span>
                            </button>
                        </div>

                        {selectedGenres.length > 0 && (
                            <div className="movies-page__active-filters">
                                {selectedGenres.map((genreId) => {
                                    const genre = genres.find((g) => g.genreId === genreId);

                                    return genre ? (
                                        <div key={genreId} className="movies-page__filter-tag">
                                            <span>{genre.name}</span>
                                            <button onClick={() => handleRemoveGenre(genreId)}>
                                                <svg width="18" height="18" viewBox="0 0 12 12" fill="none">
                                                    <path d="M3 3L9 9M9 3L3 9" stroke="#FFFFFF" strokeWidth="1.6"/>
                                                </svg>
                                            </button>
                                        </div>
                                    ) : null;
                                })}
                            </div>
                        )}
                    </div>

                    <SortSelect currentSort={sortBy} onSortChange={setSortBy} />
                </div>)}

                <div className="movies-page__content">
                    {loading ? (
                        <div className="movies-page__loading">
                            <div className="movies-page__spinner" />
                        </div>
                    ) : movies.length === 0 ? (
                        <div className="movies-page__empty">
                            <p>Фильмы не найдены</p>
                        </div>
                    ) : (
                        <>
                            <div className="movies-page__grid">
                                {movies.map((movie) => (
                                    <MovieCard
                                        key={movie.movieId}
                                        movie={movie}
                                        variant="grid"
                                    />
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="movies-page__pagination">
                                    <button
                                        className="movies-page__page-btn"
                                        disabled={currentPage <= 1}
                                        onClick={() => setCurrentPage((p) => p - 1)}
                                    >
                                        ← Назад
                                    </button>

                                    <span className="movies-page__page-info">
                                        {currentPage} из {totalPages}
                                    </span>

                                    <button
                                        className="movies-page__page-btn"
                                        disabled={currentPage >= totalPages}
                                        onClick={() => setCurrentPage((p) => p + 1)}
                                    >
                                        Далее →
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MoviesPage;