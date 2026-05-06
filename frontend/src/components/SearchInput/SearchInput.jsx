// src/components/SearchInput/SearchInput.jsx
import React from 'react';
import './SearchInput.css';

/*
 * variant: 'admin' | 'user' (default 'admin')
 */
const SearchInput = ({
                         value,
                         onChange,
                         placeholder = 'Поиск...',
                         variant = 'admin',
                         className = '',
                         ...rest
                     }) => {
    const rootClass = `search-input search-input--${variant} ${className}`.trim();

    return (
        <div className={rootClass}>
            <svg
                className="search-input__icon"
                width={variant === 'admin' ? 27 : 20}
                height={variant === 'admin' ? 27 : 20}
                viewBox="0 0 24 24"
                fill="none"
                stroke={variant === 'admin' ? '#66665D' : '#7E7E7F'}
                strokeWidth={variant === 'admin' ? 4 : 2}
            >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
            </svg>
            <input
                type="text"
                className="search-input__field"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                {...rest}
            />
        </div>
    );
};

export default SearchInput;