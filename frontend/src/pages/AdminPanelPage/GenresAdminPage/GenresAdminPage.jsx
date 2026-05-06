import React, { useState, useEffect } from 'react';
import { adminAPI, genresAPI } from '../../../api/api';
import {
    AdminPageHeader,
    AdminInput,
    AdminButton,
    TrashButton
} from '../../../components/AdminComponents/AdminComponents';
import './GenresAdminPage.css';

const GenresAdminPage = () => {
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newGenre, setNewGenre] = useState('');
    const [adding, setAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        loadGenres();
    }, []);

    const loadGenres = async () => {
        try {
            setLoading(true);
            const res = await genresAPI.getGenres();
            setGenres(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newGenre.trim()) {
            setError('Введите название жанра');
            return;
        }
        setError('');
        setAdding(true);
        try {
            const res = await adminAPI.genres.create({ name: newGenre.trim() });
            setGenres((prev) => [...prev, res.data]);
            setNewGenre('');
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка при добавлении');
        } finally {
            setAdding(false);
        }
    };

    const handleEdit = async (genreId) => {
        if (!editValue.trim()) return;
        try {
            await adminAPI.genres.update(genreId, { name: editValue.trim() });
            setGenres((prev) =>
                prev.map((g) =>
                    g.genreId === genreId ? { ...g, name: editValue.trim() } : g
                )
            );
            setEditingId(null);
            setEditValue('');
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (genreId) => {
        try {
            await adminAPI.genres.delete(genreId);
            setGenres((prev) => prev.filter((g) => g.genreId !== genreId));
        } catch (err) {
            console.error(err);
            alert('Ошибка при удалении жанра');
        }
    };

    const startEdit = (genre) => {
        setEditingId(genre.genreId);
        setEditValue(genre.name);
    };

    return (
        <div className="genres-admin">
            <AdminPageHeader
                title="Управление жанрами"
                subtitle={`${genres.length} жанр${genres.length === 1 ? '' : genres.length < 5 ? 'а' : 'ов'}`}
            />

            {/* добавить жанр */}
            <div className="genres-admin__form-card">
                <div className="genres-admin__form-left">
                    {/* Icon + title */}
                    <div className="genres-admin__form-header">
                        <div className="genres-admin__form-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                 stroke="#7E7E7F" strokeWidth="3" strokeLinecap="round">
                                <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                                <line x1="7" y1="7" x2="7.01" y2="7" />
                            </svg>
                        </div>
                        <div className="genres-admin__form-titles">
                            <h2 className="genres-admin__form-title">Добавить жанр</h2>
                            <span className="genres-admin__form-subtitle">Название жанра</span>
                        </div>
                    </div>

                    {/* Ввод */}
                    <div className="genres-admin__input-wrap">
                        <AdminInput
                            value={newGenre}
                            onChange={(e) => setNewGenre(e.target.value)}
                            placeholder="Жанр"
                            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        />
                        {error && <span className="genres-admin__error">{error}</span>}
                    </div>
                </div>

                {/* Предпросмотр + button */}
                <div className="genres-admin__form-right">
                    {/* Предпросмотр */}
                    <div className="genres-admin__preview">
                        <span className="genres-admin__preview-label">Предпросмотр</span>
                        <div className="genres-admin__preview-tag">
                            {newGenre || 'Жанр'}
                        </div>
                    </div>

                    <AdminButton onClick={handleAdd} disabled={adding}>
                        {adding ? '...' : 'Добавить'}
                    </AdminButton>
                </div>
            </div>

            {/* Genres grid */}
            {loading ? (
                <p className="genres-admin__empty">Загрузка...</p>
            ) : (
                <div className="genres-admin__grid">
                    {genres.length === 0 ? (
                        <p className="genres-admin__empty">Жанры не найдены</p>
                    ) : (
                        genres.map((genre) => (
                            <div key={genre.genreId} className="genres-admin__card">
                                {editingId === genre.genreId ? (
                                    /* Edit mode */
                                    <div className="genres-admin__edit-mode">
                                        <input
                                            className="genres-admin__edit-input"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleEdit(genre.genreId);
                                                if (e.key === 'Escape') setEditingId(null);
                                            }}
                                            autoFocus
                                        />
                                        <div className="genres-admin__edit-actions">
                                            <button
                                                className="genres-admin__save-btn"
                                                onClick={() => handleEdit(genre.genreId)}
                                            >
                                                ✓
                                            </button>
                                            <button
                                                className="genres-admin__cancel-btn"
                                                onClick={() => setEditingId(null)}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* View mode */
                                    <>
                                        <span className="genres-admin__card-name">
                                            {genre.name}
                                        </span>
                                        <div className="genres-admin__card-actions">
                                            <button
                                                className="genres-admin__pen-btn"
                                                onClick={() => startEdit(genre)}
                                                title="Редактировать"
                                            >
                                                <div className="genres-admin__pen-bg">
                                                    <svg width="20" height="20" viewBox="0 0 24 24"
                                                         fill="none" stroke="#FFFFFF" strokeWidth="1.5"
                                                         strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M12 20h9" />
                                                        <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                                                    </svg>
                                                </div>
                                            </button>
                                            <TrashButton
                                                onClick={() => handleDelete(genre.genreId)}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default GenresAdminPage;