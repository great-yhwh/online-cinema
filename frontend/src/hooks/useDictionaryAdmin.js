import { useState, useCallback, useEffect } from 'react';
import { adminAPI } from '../api/api';

export const useDictionaryAdmin = () => {
    const [words, setWords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadWords = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await adminAPI.movieWords.getAll();
            const data = res.data;
            // нормализация: если пришёл объект с полем words/items/data
            let wordsArray = [];
            if (Array.isArray(data)) wordsArray = data;
            else if (data?.words) wordsArray = data.words;
            else if (data?.items) wordsArray = data.items;
            else if (data?.data) wordsArray = data.data;
            setWords(wordsArray);
            return wordsArray;
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка загрузки слов');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const addWord = useCallback(async (wordData) => {
        try {
            const res = await adminAPI.movieWords.create(wordData);
            const newWord = res.data;
            setWords(prev => [...prev, newWord]);
            return newWord;
        } catch (err) {
            throw err;
        }
    }, []);

    const updateWord = useCallback(async (id, wordData) => {
        try {
            const res = await adminAPI.movieWords.update(id, wordData);
            const updated = res.data;
            setWords(prev =>
                prev.map(w => (w.wordId === id || w.movieWordId === id) ? updated : w)
            );
            return updated;
        } catch (err) {
            throw err;
        }
    }, []);

    const deleteWord = useCallback(async (id) => {
        try {
            await adminAPI.movieWords.delete(id);
            setWords(prev => prev.filter(w => w.wordId !== id && w.movieWordId !== id));
        } catch (err) {
            throw err;
        }
    }, []);

    useEffect(() => {
        loadWords();
    }, [loadWords]);

    return {
        words,
        loading,
        error,
        refresh: loadWords,
        addWord,
        updateWord,
        deleteWord,
    };
};