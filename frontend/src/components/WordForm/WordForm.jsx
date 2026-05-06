// src/components/WordForm/WordForm.jsx
import React, { useState } from 'react';
import { adminAPI } from '../../api/api';
import {
    AdminButton,
    AdminInput,
    SectionHeader,
} from '../AdminComponents/AdminComponents';
import WordCard from '../WordCard/WordCard';
import './WordForm.css';

const PlusIcon = () => (
    <svg
        width="18" height="18" viewBox="0 0 24 24"
        fill="none" stroke="#7E7E7F" strokeWidth="3" strokeLinecap="round"
    >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

/*
 * Props:
 *   movieId           – number|null
 *   words             – Word[]
 *   onWordsChange     – (Word[]) => void
 *   showList          – bool (default true)
 *   listTitle         – string
 */
const WordForm = ({
                      movieId,
                      words,
                      onWordsChange,
                      showList = true,
                      listTitle,
                  }) => {
    const [wordOriginal, setWordOriginal] = useState('');
    const [translation, setTranslation] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAdd = async () => {
        if (!wordOriginal.trim() || !translation.trim()) {
            setError('Заполните оба поля');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const res = await adminAPI.movieWords.create({
                movieId,
                wordOriginal: wordOriginal.trim(),
                translation: translation.trim(),
            });

            onWordsChange([...words, res.data]);
            setWordOriginal('');
            setTranslation('');
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                'Ошибка при добавлении'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await adminAPI.movieWords.delete(id);
            onWordsChange(words.filter((w) => (w.wordId || w.movieWordId) !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const resolvedTitle = listTitle ?? `Слова фильма (${words.length})`;

    return (
        <div className="word-form">
            {/* Форма */}
            <div className="word-form__card">
                <SectionHeader icon={<PlusIcon />} title="Добавить слово" />

                <div className="word-form__fields">
                    <div className="word-form__field">
                        <AdminInput
                            label="Слово (оригинал)"
                            value={wordOriginal}
                            onChange={(e) => setWordOriginal(e.target.value)}
                            placeholder="perseverance"
                        />
                    </div>

                    <div className="word-form__field">
                        <AdminInput
                            label="Перевод"
                            value={translation}
                            onChange={(e) => setTranslation(e.target.value)}
                            placeholder="настойчивость"
                        />
                    </div>

                    <div className="word-form__actions">
                        {error && (
                            <span className="word-form__error">{error}</span>
                        )}
                        <AdminButton
                            type="button"
                            onClick={handleAdd}
                            disabled={loading}
                        >
                            {loading ? '...' : 'Добавить'}
                        </AdminButton>
                    </div>
                </div>
            </div>

            {/* Список */}
            {showList && words.length > 0 && (
                <div className="word-form__list-section">
                    <h3 className="word-form__list-title">{resolvedTitle}</h3>
                    <div className="word-form__grid">
                        {words.map((w, i) => (
                            <WordCard
                                key={w.wordId || w.movieWordId || i}
                                word={w}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default WordForm;