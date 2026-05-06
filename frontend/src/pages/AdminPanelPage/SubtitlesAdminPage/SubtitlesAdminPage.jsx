import React, { useState, useMemo, useEffect } from 'react';
import { moviesAPI, adminAPI } from '../../../api/api';
import { useDataLoader } from '../../../hooks/useDataLoader';
import {
    AdminPageHeader,
    AdminInput,
    AdminSelect,
    AdminTextarea,
    AdminButton,
    SectionHeader
}
from '../../../components/AdminComponents/AdminComponents';
import SubtitleItem from '../../../components/SubtitleItem/SubtitleItem';
import './SubtitlesAdminPage.css';

const ChatIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" color="#7E7E7F">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
    </svg>
);

const LANG_OPTIONS = [
    { value: 'en', label: 'English' },
    { value: 'ru', label: 'Russian' },
    { value: 'de', label: 'Deutsch' },
    { value: 'fr', label: 'Français' },
    { value: 'es', label: 'Español' },
];

const pluralSubtitles = (count) => {
    const lastDigit = count % 10;
    const lastTwo = count % 100;
    if (lastTwo >= 11 && lastTwo <= 19) return 'субтитров';
    if (lastDigit === 1) return 'субтитр';
    if (lastDigit >= 2 && lastDigit <= 4) return 'субтитра';
    return 'субтитров';
};

const SubtitlesAdminPage = () => {
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const movies = rawMovies || [];

    // 2. Субтитры для всех фильмов
    const [subtitles, setSubtitles] = useState([]);
    const [subsLoading, setSubsLoading] = useState(false);
    const [subsError, setSubsError] = useState(null);

    useEffect(() => {
        if (!movies.length) return;

        const loadSubtitles = async () => {
            setSubsLoading(true);
            setSubsError(null);
            try {
                const results = await Promise.all(
                    movies.map((m) =>
                        adminAPI.subtitles
                            .getByMovie(m.movieId)
                            .then((res) => res.data)
                            .catch(() => [])
                    )
                );

                setSubtitles(
                    results.flatMap((arr, idx) =>
                        arr.map((sub) => ({
                            ...sub,
                            movieTitle:
                                movies[idx]?.titleRu ||
                                movies[idx]?.titleOrig ||
                                '',
                        }))
                    )
                );
            } catch (err) {
                console.error('Ошибка загрузки субтитров:', err);
                setSubsError(err.message);
            } finally {
                setSubsLoading(false);
            }
        };

        loadSubtitles();
    }, [movies]);

    // 3. Форма
    const [adding, setAdding] = useState(false);
    const [formError, setFormError] = useState('');
    const [form, setForm] = useState({
        movieId: '',
        languageCode: 'en',
        fileName: '',
        content: '',
    });

    useEffect(() => {
        if (movies.length > 0 && !form.movieId) {
            setForm((prev) => ({
                ...prev,
                movieId: String(movies[0].movieId),
            }));
        }
    }, [form.movieId, movies]);

    const handleChange = (field) => (e) =>
        setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const handleAdd = async () => {
        if (!form.movieId || !form.fileName.trim() || !form.content.trim()) {
            setFormError('Заполните все поля');
            return;
        }

        setFormError('');
        setAdding(true);

        try {
            const res = await adminAPI.subtitles.create({
                ...form,
                movieId: Number(form.movieId),
            });

            const movie = movies.find(
                (m) => String(m.movieId) === form.movieId
            );

            setSubtitles((prev) => [
                ...prev,
                {
                    ...res.data,
                    movieTitle: movie?.titleRu || movie?.titleOrig || '',
                },
            ]);

            setForm((prev) => ({ ...prev, fileName: '', content: '' }));
        } catch (err) {
            setFormError(
                err.response?.data?.message || 'Ошибка при добавлении'
            );
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await adminAPI.subtitles.delete(id);
            setSubtitles((prev) => prev.filter((s) => s.subtitleId !== id));
        } catch (err) {
            console.error(err);
            alert('Ошибка при удалении');
        }
    };

    const movieOptions = movies.map((m) => ({
        value: String(m.movieId),
        label: m.titleRu || m.titleOrig || `ID: ${m.movieId}`,
    }));

    const isLoading = moviesLoading || subsLoading;
    const error = moviesError || subsError;

    if (isLoading) {
        return (
            <div className="subtitles-admin">
                <AdminPageHeader
                    title="Управление субтитрами"
                    subtitle="Загрузка..."
                />
                <div className="subtitles-admin__loading">Загрузка...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="subtitles-admin">
                <AdminPageHeader
                    title="Управление субтитрами"
                    subtitle="Ошибка"
                />
                <div className="subtitles-admin__error">
                    <p>Ошибка: {error}</p>
                    <button onClick={refetchMovies}>Повторить</button>
                </div>
            </div>
        );
    }

    return (
        <div className="subtitles-admin">
            <AdminPageHeader
                title="Управление субтитрами"
                subtitle={`${subtitles.length} ${pluralSubtitles(subtitles.length)} по всем фильмам`}
            />

            {/* Форма добавления */}
            <div className="subtitles-admin__form-card">
                <SectionHeader icon={<ChatIcon />} title="Добавить субтитры" />

                <div className="subtitles-admin__form-row">
                    <div style={{ width: 213 }}>
                        <AdminSelect
                            label="Название фильма"
                            value={form.movieId}
                            onChange={handleChange('movieId')}
                            options={movieOptions}
                            placeholder="Выберите фильм"
                        />
                    </div>
                    <div style={{ width: 213 }}>
                        <AdminSelect
                            label="Язык"
                            value={form.languageCode}
                            onChange={handleChange('languageCode')}
                            options={LANG_OPTIONS}
                        />
                    </div>
                    <div style={{ width: 200 }}>
                        <AdminInput
                            label="Имя файла"
                            value={form.fileName}
                            onChange={handleChange('fileName')}
                            placeholder="subtitle.vtt"
                        />
                    </div>
                </div>

                <div className="subtitles-admin__content-row">
                    <div className="subtitles-admin__textarea-wrap">
                        <AdminTextarea
                            label="Содержимое файла"
                            value={form.content}
                            onChange={handleChange('content')}
                            placeholder="WEBVTT&#10;&#10;00:00:01.000 --> 00:00:04.000&#10;Hello world!"
                            rows={7}
                        />
                    </div>
                    <div className="subtitles-admin__add-btn-wrap">
                        {formError && (
                            <span className="subtitles-admin__error">
                                {formError}
                            </span>
                        )}
                        <AdminButton onClick={handleAdd} disabled={adding}>
                            {adding ? '...' : 'Добавить'}
                        </AdminButton>
                    </div>
                </div>
            </div>

            {/* Список субтитров */}
            <div className="subtitles-admin__section">
                <h3 className="subtitles-admin__section-title">Все файлы</h3>
                <div className="subtitles-admin__list-card">
                    <div className="subtitles-admin__pairs">
                        {subtitles.length === 0 ? (
                            <p className="subtitles-admin__empty">
                                Субтитры не найдены
                            </p>
                        ) : (
                            Array.from(
                                { length: Math.ceil(subtitles.length / 2) },
                                (_, i) => subtitles.slice(i * 2, i * 2 + 2)
                            ).map((pair, rowIdx) => (
                                <div
                                    key={rowIdx}
                                    className="subtitles-admin__pair-row"
                                >
                                    {pair.map((sub) => (
                                        <SubtitleItem
                                            key={sub.subtitleId}
                                            subtitle={sub}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubtitlesAdminPage;