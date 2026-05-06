import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { dictionaryAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import './DictionaryPage.css';

const DictionaryPage = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [words, setWords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/');
            return;
        }
        loadDictionary();
    }, [isAuthenticated, navigate]);

    const loadDictionary = async () => {
        try {
            const res = await dictionaryAPI.getMyDictionary();
            setWords(res.data);
        } catch (err) {
            console.error('Failed to load dictionary:', err);
        } finally {
            setLoading(false);
        }
    };

    const removeWord = async (wordId) => {
        try {
            await dictionaryAPI.removeWord(wordId);
            setWords((prev) => prev.filter((w) => w.wordId !== wordId));
        } catch (err) {
            console.error('Failed to remove word:', err);
        }
    };

    const filteredWords = words.filter(
        (w) =>
            w.wordOriginal.toLowerCase().includes(searchQuery.toLowerCase()) ||
            w.translation.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="dictionary-page dictionary-page--loading">
                <div className="dictionary-page__spinner" />
            </div>
        );
    }

    return (
        <div className="dictionary-page">
            <div className="dictionary-page__container">
                {/* Заголовок и линия */}
                <div className="dictionary-page__header-block">
                    <h2 className="dictionary-page__title">Мой словарь</h2>
                    <div className="dictionary-page__divider" />
                </div>

                {/* Кнопка игры (появляется, если есть слова) */}
                {words.length > 0 && (
                    <div className="dictionary-page__controls">
                        <Link to="/game" className="dictionary-page__game-btn">
                            Найди пару
                        </Link>
                        {/* Поиск */}
                        <div className="dictionary-page__search-wrap">
                            <input
                                type="text"
                                className="dictionary-page__search"
                                placeholder="Поиск..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <svg className="dictionary-page__search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7E7E7F" strokeWidth="2">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </div>
                    </div>
                )}

                {/* Список слов */}
                {words.length === 0 ? (
                    <div className="dictionary-page__empty">
                        <p>Словарь пуст</p>
                        <span>Добавляйте слова на странице просмотра фильма</span>
                    </div>
                ) : (
                    <div className="dictionary-page__grid">
                        {filteredWords.map((word) => (
                            <div key={word.userWordId} className="dictionary-page__item">
                                {/* Кнопка удаления (Trash) */}
                                <button
                                    className="dictionary-page__remove-btn"
                                    onClick={() => removeWord(word.wordId)}
                                    title="Удалить слово"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                </button>

                                {/* Слово оригинал */}
                                <span className="dictionary-page__word-orig">
                                    {word.wordOriginal}
                                </span>

                                {/* Иконка-разделитель (Минус) */}
                                <div className="dictionary-page__separator">
                                    <svg width="18" height="2" viewBox="0 0 18 2" fill="none">
                                        <path d="M0 1H18" stroke="white" strokeWidth="1.6"/>
                                    </svg>
                                </div>

                                {/* Перевод */}
                                <span className="dictionary-page__word-trans">
                                    {word.translation}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DictionaryPage;