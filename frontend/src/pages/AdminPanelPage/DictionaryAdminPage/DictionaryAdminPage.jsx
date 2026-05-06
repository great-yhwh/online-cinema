// src/pages/Admin/DictionaryAdminPage/DictionaryAdminPage.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { moviesAPI, dictionaryAPI } from '../../../api/api';
import { useDataLoader } from '../../../hooks/useDataLoader';
import {
    AdminPageHeader
} from '../../../components/AdminComponents/AdminComponents';
import SearchInput from '../../../components/SearchInput/SearchInput';
import WordCard from '../../../components/WordCard/WordCard';
import './DictionaryAdminPage.css';

const pluralWords = (count) => {
    const lastDigit = count % 10;
    const lastTwo = count % 100;
    if (lastTwo >= 11 && lastTwo <= 19) return 'слов';
    if (lastDigit === 1) return 'слово';
    if (lastDigit >= 2 && lastDigit <= 4) return 'слова';
    return 'слов';
};

const DictionaryAdminPage = () => {
    // 1. Фильмы
    const baseQueries = useMemo(() => [
        {
            key: 'movies',
            fetcher: () => moviesAPI.getMovies({}),
            normalize: true,
            normalizeKeys: ['movies', 'items', 'data'],
        },
    ], []);

    const {
        movies: rawMovies,
        isLoading: moviesLoading,
        error: moviesError,
        refetch: refetchMovies,
    } = useDataLoader(baseQueries);

    let movies;
    movies = rawMovies || [];

    // 2. Слова для всех фильмов
    const [words, setWords] = useState([]);
    const [wordsLoading, setWordsLoading] = useState(false);
    const [wordsError, setWordsError] = useState(null);

    useEffect(() => {
        if (!movies.length) return;

        const loadAllWords = async () => {
            setWordsLoading(true);
            setWordsError(null);
            try {
                const results = await Promise.all(
                    movies.map((m) =>
                        dictionaryAPI
                            .getMovieWords(m.movieId)
                            .then((res) => res.data)
                            .catch(() => [])
                    )
                );

                setWords(
                    results.flatMap((arr, idx) =>
                        arr.map((word) => ({
                            ...word,
                            movieTitle:
                                movies[idx]?.titleRu ||
                                movies[idx]?.titleOrig ||
                                '',
                        }))
                    )
                );
            } catch (err) {
                console.error('Ошибка загрузки слов:', err);
                setWordsError(err.message);
            } finally {
                setWordsLoading(false);
            }
        };

        loadAllWords();
    }, [movies]);

    // 3. Поиск
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        if (!search.trim()) return words;

        const q = search.toLowerCase();
        return words.filter((w) => {
            const en = (w.wordOriginal || '').toLowerCase();
            const ru = (w.translation || '').toLowerCase();
            return en.includes(q) || ru.includes(q);
        });
    }, [words, search]);

    const isLoading = moviesLoading || wordsLoading;
    const error = moviesError || wordsError;

    if (isLoading) {
        return (
            <div className="dict-admin">
                <AdminPageHeader title="Словарь" subtitle="Загрузка..." />
                <div className="dict-admin__loading">Загрузка...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dict-admin">
                <AdminPageHeader title="Словарь" subtitle="Ошибка" />
                <div className="dict-admin__error">
                    <p>Ошибка: {error}</p>
                    <button onClick={refetchMovies}>Повторить</button>
                </div>
            </div>
        );
    }

    return (
        <div className="dict-admin">
            <AdminPageHeader
                title="Словарь"
                subtitle={`${words.length} ${pluralWords(words.length)} в глобальном словаре`}
            />

            {/* Поиск */}
            <SearchInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск по слову или переводу..."
                variant="admin"
            />

            {/* Сетка слов */}
            <div className="dict-admin__grid">
                {filtered.length === 0 ? (
                    <p className="dict-admin__empty">
                        {search ? 'Ничего не найдено' : 'Словарь пуст'}
                    </p>
                ) : (
                    filtered.map((word) => (
                        <WordCard
                            key={word.wordId || word.movieWordId}
                            word={word}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default DictionaryAdminPage;