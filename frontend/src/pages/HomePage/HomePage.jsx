import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { moviesAPI, favoritesAPI, genresAPI } from '../../api/api';
import MovieCard from '../../components/MovieCard/MovieCard';
import HorizontalScroll from '../../components/HorizontalScroll/HorizontalScroll';
import './HomePage.css';
import SearchBar from "../../components/Search/SearchBar";

const HomePage = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [allMovies, setAllMovies] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [topMovies, setTopMovies] = useState([]);
    const [genres, setGenres] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            try {
                const genresRes = await genresAPI.getGenres();
                if (isMounted) setGenres(genresRes.data || []);

                const moviesRes = await moviesAPI.getMovies({
                    sortBy: 'rating',
                    sortOrder: 'desc',
                    pageSize: 10,
                });
                if (isMounted) {
                    setAllMovies(moviesRes.data.items || []);
                    setTopMovies(moviesRes.data.items || []);
                }

                if (isAuthenticated) {
                    try {
                        const favRes = await favoritesAPI.getFavorites();
                        if (isMounted) setFavorites(favRes.data || []);
                    } catch {
                        if (isMounted) setFavorites([]);
                    }
                }
            } catch (err) {
                console.error('Failed to load data:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadData();
        return () => { isMounted = false; };
    }, [isAuthenticated]);

    const handleSearch = () => {
        if (searchQuery.trim()) {
            navigate(`/movies?query=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const handleGenreClick = (genreId) => {
        navigate(`/movies?genreId=${genreId}`);
    };

    const removeFavorite = async (movieId) => {
        try {
            await favoritesAPI.removeFavorite(movieId);
            setFavorites((prev) => prev.filter((f) => f.movieId !== movieId));
        } catch (err) {
            console.error('Failed to remove favorite:', err);
        }
    };

    return (
        <div className="home">
            {/* ===== ЭКРАН 1: HERO ===== */}
            <section className="home__hero">
                <div className="home__hero-content">
                    <div className="home__hero-title-block">
                        <h1 className="home__hero-title">
                            {isAuthenticated
                                ? 'Учите английский смотря фильмы'
                                : 'Смотрите фильмы онлайн в HD'}
                        </h1>
                        <p className="home__hero-subtitle">
                            {isAuthenticated
                                ? 'Двойные субтитры, словарь слов и интерактивные игры для эффективного изучения языка'
                                : 'Наслаждайтесь эксклюзивными премьерами и любимой классикой с двойными субтитрами для изучения английского языка.'}
                        </p>
                    </div>

                    <SearchBar
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onSearch={handleSearch}
                    />

                    <div className="home__genres">
                        {genres.map((genre) => (
                            <button
                                key={genre.genreId}
                                className="home__genre-btn"
                                onClick={() => handleGenreClick(genre.genreId)}
                            >
                                {genre.name}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== AUTHENTICATED ===== */}
            {isAuthenticated ? (
                <>
                    {/* Избранное -  HorizontalScroll */}
                    <HorizontalScroll
                        title="Избранное"
                        movies={favorites}
                        variant="favorite"
                        emptyText="Добавьте фильмы в избранное"
                        linkTo="/favorites"
                        onRemove={removeFavorite}
                    />

                    {/* Топ фильмов -  HorizontalScroll */}
                    <HorizontalScroll
                        title="Топ фильмов"
                        movies={topMovies}
                        variant="top"
                        emptyText="Нет фильмов"
                        linkTo="/movies"
                    />
                </>
            ) : (
                <>
                    {/* Как учить */}
                    <section className="home__how">
                        <h2 className="home__how-title">Как учить английский на Movix?</h2>
                        <div className="home__how-grid">
                            <div className="home__how-row">
                                <div className="home__how-card home__how-card--small">
                                    <p className="home__how-card-text">
                                        Подберите фильм, мультфильм или сериал по уровню сложности и акценту
                                    </p>
                                    <span className="home__how-card-number">1</span>
                                </div>
                                <div className="home__how-card home__how-card--large">
                                    <p className="home__how-card-text">
                                        Изучите словарь из слов, фраз и выражений, вручную отобранный для каждого фильма или сериала
                                    </p>
                                    <span className="home__how-card-number">2</span>
                                </div>
                            </div>
                            <div className="home__how-row">
                                <div className="home__how-card home__how-card--large">
                                    <p className="home__how-card-text">
                                        Смотрите фильм с двойными субтитрами и добавляйте незнакомые слова в свой словарь
                                    </p>
                                    <span className="home__how-card-number">3</span>
                                </div>
                                <div className="home__how-card home__how-card--small">
                                    <p className="home__how-card-text">
                                        Закрепите знания в игре «Найди пару» — соединяйте слова с их переводом
                                    </p>
                                    <span className="home__how-card-number">4</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Фильмы grid */}
                    <section className="home__movies">
                        <h2 className="home__movies-title">
                            Сотни сериалов, тысячи фильмов и мультфильмов в оригинальной озвучке
                        </h2>
                        {loading ? (
                            <div className="home__loading"><div className="home__spinner" /></div>
                        ) : (
                            <div className="home__movies-grid">
                                {allMovies.slice(0, 6).map((movie) => (
                                    <MovieCard
                                        key={movie.movieId}
                                        movie={movie}
                                        variant={"default"}
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                </>
            )}
        </div>
    );
};

export default HomePage;