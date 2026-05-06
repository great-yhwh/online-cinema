import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { historyAPI, STATIC_URL } from '../../api/api';
import './MovieCard.css';
import RatingBadge from "../RatingBadge/RatingBadge";

const defaultHandleImageError = (e) => {
    e.target.style.background = '#222226';
    e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" fill="%23222226"><rect width="300" height="450"/></svg>';
};

const PosterImage = ({ movie, className = "movie-card__poster-img", customOnError }) => (
    <img
        className={className}
        src={`${STATIC_URL}${movie.posterPath}`}
        alt={movie.titleRu || movie.titleOrig}
        crossOrigin="anonymous"
        onError={customOnError || defaultHandleImageError}
    />
);

const MovieCard = ({
                       movie,
                       variant = 'default',
                       index,
                       onRemove,
                   }) => {
    const navigate = useNavigate();

    if (!movie) return null;

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    const handleClick = () => {
        navigate(`/movie/${movie.movieId}`);
    };

    // ===== ВАРИАНТ: ИЗБРАННОЕ =====
    if (variant === 'favorite') {
        return (
            <div className="movie-card movie-card--favorite">
                <div className="movie-card__poster-wrap">
                    {/*!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!*/}
                    <Link to={`/movie/${movie.movieId}`}>
                        <PosterImage movie={movie} />
                    </Link>

                    {/* Вставляем рейтинг */}
                    <RatingBadge
                        rating={movie.kinopoiskRating}
                        className="rating-badge--absolute"
                    />

                    {onRemove && (
                        <button
                            className="movie-card__remove-btn"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onRemove(historyAPI.removeFromHistory);
                            }}
                        >
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2">
                                <path d="M3 3L9 9M9 3L3 9" />
                            </svg>
                        </button>
                    )}
                </div>
                <h3 className="movie-card--favorite__title-ru">{movie.titleRu || movie.titleOrig}</h3>
                <p className="movie-card--favorite__title-orig">{movie.titleOrig}</p>
                <p className="movie-card__meta">
                    {movie.year}
                    {movie.genres?.length > 0 && ` ${movie.genres.join(', ').toLowerCase()}`}
                </p>
            </div>
        );
    }

    // ===== ВАРИАНТ: ТОП ФИЛЬМОВ =====
    if (variant === 'top') {
        return (
            <div className="movie-card movie-card--top">
                <div className="movie-card__number-wrap">
                    <span className="movie-card__number">{index}</span>
                </div>
                <div className="movie-card__top-content">
                    <Link to={`/movie/${movie.movieId}`}>
                        <PosterImage movie={movie} />
                    </Link>

                    <RatingBadge
                        rating={movie.kinopoiskRating}
                        className="rating-badge--absolute"
                    />

                    <h3 className="movie-card__title-ru">{movie.titleRu || movie.titleOrig}</h3>
                    <p className="movie-card__meta ">
                        {movie.year}
                        {movie.genres?.length > 0 && ` ${movie.genres.join(', ').toLowerCase()}`}
                    </p>
                </div>
            </div>
        );
    }

    // ===== ВАРИАНТ: GRID =====
    if (variant === 'grid') {
        return (
            <div className="movie-card movie-card--grid" onClick={handleClick}>
                <div className="movie-card__poster-container">
                    <PosterImage movie={movie} />

                    <RatingBadge
                        rating={movie.kinopoiskRating}
                        className="rating-badge--absolute"
                    />

                    {onRemove && (
                        <button
                            className="movie-card__remove-btn movie-card__remove-btn--large"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onRemove(movie.movieId);
                            }}
                        >
                            <svg width="24" height="24" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2">
                                <path d="M3 3L9 9M9 3L3 9" />
                            </svg>
                        </button>
                    )}
                </div>
                <h3 className="movie-card__title-ru">{movie.titleRu || movie.titleOrig}</h3>
                <p className="movie-card__title-orig">{movie.titleOrig}</p>
                <p className="movie-card__meta">
                    {movie.year} {movie.genres?.join(', ').toLowerCase()}
                </p>
            </div>
        );
    }

    // ===== ВАРИАНТ: HISTORY =====
    if (variant === 'history') {
        return (
            <div className="movie-card movie-card--history" onClick={() => navigate(`/movie/${movie.movieId}`)}>
                <div className="movie-card__poster-wrap">
                    <Link to={`/movie/${movie.movieId}`}>
                        <PosterImage
                            movie={movie}
                            customOnError={(e) => { e.target.src = '/no-poster.png'; }}
                        />
                    </Link>

                    <RatingBadge
                        rating={movie.kinopoiskRating}
                        className="rating-badge--absolute"
                    />

                    {onRemove && (
                        <button
                            className="movie-card__action-btn"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onRemove(movie.movieId);
                            }}
                            title="Удалить из просмотренного"
                        >
                            <svg className="movie-card__icon-eye" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                            <svg className="movie-card__icon-close" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    )}
                </div>

                <div className="movie-card__info">
                    <h3 className="movie-card__title-ru">{movie.titleRu || movie.titleOrig}</h3>
                    <p className="movie-card__title-orig">{movie.titleOrig}</p>
                    <p className="movie-card__meta">
                        {movie.year} {movie.genres?.join(', ').toLowerCase()}
                    </p>
                </div>
            </div>
        );
    }

    // ===== ДЕФОЛТНЫЙ ВАРИАНТ (Simple) =====
    return (
        <div className="movie-card movie-card--simple" onClick={handleClick}>
            <Link to={`/movie/${movie.movieId}`}>
                <PosterImage movie={movie} />
            </Link>
            <h3 className="movie-card__title-ru">{movie.titleRu || movie.titleOrig}</h3>
        </div>
    );
};

export default MovieCard;