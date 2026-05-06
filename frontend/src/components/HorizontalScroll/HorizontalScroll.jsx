import React, { useRef } from 'react';
import MovieCard from '../MovieCard/MovieCard';
import './HorizontalScroll.css';

const HorizontalScroll = ({
                              title,
                              movies,
                              emptyText = 'Нет фильмов',
                              variant = 'default',
                              linkTo,               // Опциональная ссылка в заголовке
                              onRemove              // Для избранного
                          }) => {
    const scrollRef = useRef(null);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = 460;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    if (!movies || movies.length === 0) {
        return (
            <section className="h-scroll-section">
                <h2 className="h-scroll-section__title">{title}</h2>
                <p className="h-scroll-section__empty">{emptyText}</p>
            </section>
        );
    }

    return (
        <section className="h-scroll-section">
            <div className="h-scroll-section__header">
                <div className="h-scroll-section__title-wrap">
                    <h2 className="h-scroll-section__title">{title}</h2>
                    {linkTo && (
                        <a href={linkTo} className="h-scroll-section__link">
                            <svg width="20" height="28" viewBox="0 0 20 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2 18L6 14L2 10M6 26L18 14L6 2" stroke="#7E7E7F" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </a>
                    )}
                </div>
                <div className="h-scroll-section__controls">
                    <button className="h-scroll-section__arrow" onClick={() => scroll('left')}>←</button>
                    <button className="h-scroll-section__arrow" onClick={() => scroll('right')}>→</button>
                </div>
            </div>
            <div className={`h-scroll-section__track ${variant === 'top' ? 'h-scroll-section__track--top' : ''}`} ref={scrollRef}>
                {movies.map((movie, index) => (
                    <MovieCard
                        key={movie.movieId || movie.favoriteId}
                        movie={movie}
                        variant={variant}
                        index={variant === 'top' ? index + 1 : undefined}
                        onRemove={onRemove}
                    />
                ))}
            </div>
        </section>
    );
};

export default HorizontalScroll;