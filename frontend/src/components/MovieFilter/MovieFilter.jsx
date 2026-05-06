import React from 'react';
import './MovieFilter.css';

const MovieFilter = ({
                         isOpen,
                         onClose,
                         genres,
                         selectedGenres,
                         onToggleGenre,
                         onReset,
                         onApply
                     }) => {
    const genreRows = [];
    for (let i = 0; i < genres.length; i += 2) {
        genreRows.push(genres.slice(i, i + 2));
    }

    const handleApply = () => {
        onApply();
    };

    return (
        <aside className={`filter-sidebar ${isOpen ? 'filter-sidebar--open' : ''}`}>
            <div className="filter-sidebar__inner">
                <div className="filter-sidebar__header">
                    <h2>Настройки поиска</h2>
                    <button className="filter-sidebar__close" onClick={onClose}>
                        <svg width="32" height="32" viewBox="0 0 12 12" fill="none">
                            <path d="M3 3L9 9M9 3L3 9" stroke="#1E1E1E" strokeWidth="3" />
                        </svg>
                    </button>
                </div>

                <div className="filter-sidebar__type-buttons">
                    <button className="filter-sidebar__type-btn filter-sidebar__type-btn--active">
                        <span>Фильмы</span>
                        <span className="filter-sidebar__type-info">Выбрано</span>
                    </button>
                    <button className="filter-sidebar__type-btn">
                        <span>Сериалы</span>
                        <span className="filter-sidebar__type-info">Выбрать</span>
                    </button>
                </div>

                <div className="filter-sidebar__genre-header">
                    <h4>Жанр</h4>
                    <button onClick={onReset}>Сбросить</button>
                </div>

                <div className="filter-sidebar__genres">
                    {genreRows.map((row, rowIndex) => (
                        <div key={rowIndex} className="filter-sidebar__genre-row">
                            {row.map((genre) => (
                                <label key={genre.genreId} className="filter-sidebar__genre-item">
                                    <input
                                        type="checkbox"
                                        checked={selectedGenres.includes(genre.genreId)}
                                        onChange={() => onToggleGenre(genre.genreId)}
                                    />
                                    <span>{genre.name}</span>
                                </label>
                            ))}
                        </div>
                    ))}
                </div>

                <div className="filter-sidebar__footer">
                    <button className="filter-sidebar__reset-all" onClick={onReset}>
                        <svg width="20" height="20" viewBox="0 0 12 12" fill="none">
                            <path d="M3 3L9 9M9 3L3 9" stroke="#EC221F" strokeWidth="2" />
                        </svg>
                        <span>Сбросить все</span>
                    </button>

                    <button className="filter-sidebar__apply" onClick={handleApply}>
                        Показать
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default MovieFilter;