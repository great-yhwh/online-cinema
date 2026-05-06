import React from 'react';
import './AdminComponents.css';

// ==================== Page Header ====================
export const AdminPageHeader = ({ title, subtitle, children }) => (
    <div className="adm-header">
        <div className="adm-header__text">
            <h1 className="adm-header__title">{title}</h1>
            {subtitle && <p className="adm-header__subtitle">{subtitle}</p>}
        </div>
        {children && <div className="adm-header__actions">{children}</div>}
    </div>
);

// ==================== Stat Card ====================
export const StatCard = ({ label, value, sublabel, icon }) => (
    <div className="adm-stat-card">
        <div className="adm-stat-card__info">
            <span className="adm-stat-card__label">{label}</span>
            <span className="adm-stat-card__value">{value}</span>
            <span className="adm-stat-card__sublabel">{sublabel}</span>
        </div>
        <div className="adm-stat-card__icon">
            {icon}
        </div>
    </div>
);

// ==================== Input Field ====================
export const AdminInput = ({ label, value, onChange, placeholder, type = 'text', ...props }) => (
    <div className="adm-input">
        {label && <label className="adm-input__label">{label}</label>}
        <input
            type={type}
            className="adm-input__field"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            {...props}
        />
    </div>
);

//  Текстовое поле
export const AdminTextarea = ({ label, value, onChange, placeholder, rows = 8, ...props }) => (
    <div className="adm-input">
        {label && <label className="adm-input__label">{label}</label>}
        <textarea
            className="adm-input__field adm-input__field--textarea"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            {...props}
        />
    </div>
);

// Выборы
export const AdminSelect = ({ label, value, onChange, options, placeholder }) => (
    <div className="adm-input">
        {label && <label className="adm-input__label">{label}</label>}
        <div className="adm-select">
            <select
                className="adm-select__field"
                value={value}
                onChange={onChange}
            >
                {placeholder && <option value="">{placeholder}</option>}
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            <div className="adm-select__arrows">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 15l-6-6-6 6" />
                </svg>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round">
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </div>
        </div>
    </div>
);

// Числовые поля
export const AdminNumberInput = ({ label, value, onChange, min, max, step = 1, placeholder }) => {
    const increment = () => {
        const next = (parseFloat(value) || 0) + step;
        if (max !== undefined && next > max) return;
        onChange({ target: { value: parseFloat(next.toFixed(2)) } });
    };
    const decrement = () => {
        const next = (parseFloat(value) || 0) - step;
        if (min !== undefined && next < min) return;
        onChange({ target: { value: parseFloat(next.toFixed(2)) } });
    };

    return (
        <div className="adm-input">
            {label && <label className="adm-input__label">{label}</label>}
            <div className="adm-number">
                <input
                    type="number"
                    className="adm-number__field"
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    min={min}
                    max={max}
                    step={step}
                />
                <div className="adm-number__arrows">
                    <button type="button" className="adm-number__btn" onClick={increment}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round">
                            <path d="M18 15l-6-6-6 6" />
                        </svg>
                    </button>
                    <button type="button" className="adm-number__btn" onClick={decrement}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round">
                            <path d="M6 9l6 6 6-6" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export const AdminButton = ({ children, onClick, type = 'button', variant = 'primary', disabled, className = '' }) => (
    <button
        type={type}
        className={`adm-btn adm-btn--${variant} ${className}`}
        onClick={onClick}
        disabled={disabled}
    >
        {children}
    </button>
);

// Жанры тэги
export const GenreTag = ({ name, onRemove, selectable, selected, onClick }) => (
    <span
        className={`adm-genre-tag ${selectable ? 'adm-genre-tag--selectable' : ''} ${selected ? 'adm-genre-tag--selected' : ''}`}
        onClick={onClick}
    >
        {name}
        {onRemove && (
            <button className="adm-genre-tag__remove" onClick={(e) => { e.stopPropagation(); onRemove(); }}>
                ×
            </button>
        )}
    </span>
);

// мусорка
export const TrashButton = ({ onClick, title = 'Удалить' }) => (
    <button className="adm-trash-btn" onClick={onClick} title={title}>
        <div className="adm-trash-btn__bg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3,6 5,6 21,6" />
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
        </div>
    </button>
);

// редактор
export const EditButton = ({ onClick, title = 'Изменить' }) => (
    <button className="adm-edit-btn" onClick={onClick} title={title}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
        <span>Изменить</span>
    </button>
);

// выберите файл
export const DropZone = ({ text, formats, onDrop, onBrowse, isDragOver }) => {
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const files = e.dataTransfer.files;
        if (files.length > 0 && onDrop) {
            onDrop(files[0]);
        }
    };

    return (
        <div
            className={`adm-dropzone ${isDragOver ? 'adm-dropzone--active' : ''}`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={onBrowse}
        >
            <span className="adm-dropzone__text">{text}</span>
            <span className="adm-dropzone__formats">Поддерживаются: {formats}</span>
        </div>
    );
};

// Хэдер селектион
export const SectionHeader = ({ icon, title }) => (
    <div className="adm-section-header">
        {icon && (
            <div className="adm-section-header__icon">
                {icon}
            </div>
        )}
        <h2 className="adm-section-header__title">{title}</h2>
    </div>
);

export const AdminTabs = ({ tabs, activeTab, onTabChange }) => (
    <div className="adm-tabs">
        {tabs.map((tab) => (
            <button
                key={tab.key}
                className={`adm-tabs__tab ${activeTab === tab.key ? 'adm-tabs__tab--active' : ''}`}
                onClick={() => onTabChange(tab.key)}
            >
                {tab.label}
            </button>
        ))}
    </div>
);