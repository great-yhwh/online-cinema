import { useState, useRef, useEffect } from 'react';
import './SortSelect.css';

const sortOptions = [
    { value: 'rating', label: 'Рейтингу Кинопоиска' },
    { value: 'year', label: 'Году выпуска' },
    { value: 'title', label: 'Алфавиту' },
];

export default function SortDropdown({ currentSort, onSortChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Закрытие при клике вне компонента
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const currentLabel = sortOptions.find((opt) => opt.value === currentSort)?.label || '';

    const handleSelect = (value) => {
        onSortChange(value);
        setIsOpen(false);
    };

    return (
        <div
            className="sort-dropdown"
            ref={dropdownRef}
            onClick={() => setIsOpen(!isOpen)}
        >
            <div className="sort-dropdown__content">
                <span className="sort-dropdown__label">Сортировать по</span>
                <span className="sort-dropdown__value">{currentLabel}</span>
            </div>

            <svg
                className={`sort-dropdown__icon ${isOpen ? 'sort-dropdown__icon--open' : ''}`}
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
            >
                <path
                    d="M6 9L12 15L18 9"
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                />
            </svg>

            {isOpen && (
                <div className="sort-dropdown__menu">
                    {sortOptions.map((option) => (
                        <div
                            key={option.value}
                            className={`sort-dropdown__option ${
                                option.value === currentSort ? 'sort-dropdown__option--active' : ''
                            }`}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSelect(option.value);
                            }}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}