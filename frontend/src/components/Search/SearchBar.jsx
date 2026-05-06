import React from 'react';
import './SearchBar.css'
const SearchBar = ({
                              value,
                              onChange,
                              onSearch,
                              placeholder = 'Найти фильм, сериал...',
                              buttonText = 'Найти',
                              className = '',
                          }) => {
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            onSearch();
        }
    };

    return (
        <div className='search-bar'>
            <svg
                className="search-bar__icon"
                width="27"
                height="27"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#66665D"
                strokeWidth="4"
            >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
            </svg>

            <input
                type="text"
                className="search-bar__input"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                onKeyDown={handleKeyDown}
            />

            <button className="search-bar__btn" onClick={onSearch}>
                {buttonText}
            </button>
        </div>
    );
};
export default SearchBar;