import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    adminAPI,
    genresAPI,
    moviesAPI,
    dictionaryAPI,
    STATIC_URL,
} from '../../../api/api';
import {
    AdminPageHeader,
    AdminInput,
    AdminTextarea,
    AdminNumberInput,
    AdminButton,
    GenreTag,
    DropZone,
    AdminTabs,
}
from '../../../components/AdminComponents/AdminComponents';
import './AddMoviePage.css';
import MovieRequiredGuard from "../../../components/MovieRequiredGuard/MovieRequiredGuard";
import SubtitleForm from "../../../components/SubtitleForm/SubtitleForm";
import WordForm from "../../../components/WordForm/WordForm";

const normalizeGenreIds = (movie, allGenres = []) => {
    const rawGenres = movie.genreIds || movie.genres || movie.movieGenres || [];

    return rawGenres
        .map((g) => {
            if (typeof g === 'number') return Number(g);

            if (typeof g === 'string') {
                const asNumber = Number(g);
                if (!Number.isNaN(asNumber)) return asNumber;

                const byName = allGenres.find((x) => x.name === g);
                return byName ? Number(byName.genreId) : NaN;
            }

            if (g?.genreId != null) return Number(g.genreId);
            if (g?.id != null) return Number(g.id);
            if (g?.genre?.genreId != null) return Number(g.genre.genreId);
            if (g?.genre?.id != null) return Number(g.genre.id);

            if (g?.name) {
                const byName = allGenres.find((x) => x.name === g.name);
                return byName ? Number(byName.genreId) : NaN;
            }

            return NaN;
        })
        .filter((id) => Number.isFinite(id));
};

const buildStaticUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${STATIC_URL}${path}`;
};

//  MAIN
const MainTab = ({ form, setForm, genres }) => {
    const fileInputRef = useRef(null);
    const [uploadingPoster, setUploadingPoster] = useState(false);

    const posterPreview = form.posterPath || null;

    const handleChange = (field) => (e) => {
        setForm((prev) => ({
            ...prev,
            [field]: e.target.value,
        }));
    };

    const toggleGenre = (genreId) => {
        const id = Number(genreId);

        setForm((prev) => {
            const hasGenre = prev.genreIds.includes(id);

            return {
                ...prev,
                genreIds: hasGenre
                    ? prev.genreIds.filter((x) => x !== id)
                    : [...prev.genreIds, id],
            };
        });
    };

    const handlePosterUpload = async (file) => {
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Можно загружать только изображения');
            return;
        }

        setUploadingPoster(true);

        try {
            const res = await adminAPI.upload.poster(file);
            const path = res.data?.path;

            if (!path) {
                throw new Error('Сервер не вернул путь к постеру');
            }

            setForm((prev) => ({
                ...prev,
                posterPath: path,
            }));
        } catch (err) {
            console.error('Poster upload error:', err.response?.data || err);
            alert(
                err.response?.data?.error ||
                err.response?.data?.message ||
                'Ошибка загрузки постера'
            );
        } finally {
            setUploadingPoster(false);
        }
    };

    const handlePosterDrop = (file) => {
        handlePosterUpload(file);
    };

    const handleRemovePoster = () => {
        setForm((prev) => ({
            ...prev,
            posterPath: '',
        }));

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="add-movie__tab-content">
            <div className="add-movie__form-card">
                <div className="add-movie__row">
                    <AdminInput
                        label="Оригинальное название *"
                        value={form.titleOrig}
                        onChange={handleChange('titleOrig')}
                        placeholder="The Silence of the Lambs"
                    />
                    <AdminInput
                        label="Название (ru)"
                        value={form.titleRu}
                        onChange={handleChange('titleRu')}
                        placeholder="Молчание ягнят"
                    />
                    <AdminNumberInput
                        label="Рейтинг Кинопоиска"
                        value={form.kinopoiskRating}
                        onChange={handleChange('kinopoiskRating')}
                        placeholder="0"
                        min={0}
                        max={10}
                        step={0.1}
                    />
                </div>

                <div className="add-movie__row">
                    <AdminNumberInput
                        label="Длительность (мин)"
                        value={form.duration}
                        onChange={handleChange('duration')}
                        placeholder="100"
                        min={1}
                        step={1}
                    />
                    <AdminInput
                        label="Страна"
                        value={form.country}
                        onChange={handleChange('country')}
                        placeholder="США"
                    />
                    <AdminNumberInput
                        label="Год выпуска"
                        value={form.year}
                        onChange={handleChange('year')}
                        placeholder="1990"
                        min={1900}
                        max={2099}
                        step={1}
                    />
                </div>

                <div className="add-movie__row add-movie__row--descriptions">
                    <AdminTextarea
                        label="Описание (ru)"
                        value={form.describeRu}
                        onChange={handleChange('describeRu')}
                        placeholder="Введите текст"
                        rows={10}
                    />
                    <AdminTextarea
                        label="Описание (en)"
                        value={form.describeEng}
                        onChange={handleChange('describeEng')}
                        placeholder="Enter description"
                        rows={10}
                    />
                </div>

                <div className="add-movie__row add-movie__row--genres">
                    <div className="add-movie__genres-block">
                        <label className="add-movie__genres-label">Жанры</label>
                        <div className="add-movie__genres-list">
                            {genres.map((g) => {
                                const id = Number(g.genreId);
                                const selected = form.genreIds.includes(id);

                                return (
                                    <GenreTag
                                        key={g.genreId}
                                        name={g.name}
                                        selectable
                                        selected={selected}
                                        onClick={() => toggleGenre(id)}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    <AdminButton type="submit">
                        Сохранить фильм
                    </AdminButton>
                </div>
            </div>

            <div className="add-movie__poster-zone">
                {posterPreview ? (
                    <div className="add-movie__poster-preview">
                        <img
                            src={buildStaticUrl(posterPreview)}
                            alt="Постер"
                        />
                        <button
                            type="button"
                            className="add-movie__poster-remove"
                            onClick={handleRemovePoster}
                        >
                            ×
                        </button>
                    </div>
                ) : (
                    <DropZone
                        text="Перетащите постер сюда"
                        formats="JPG, PNG, WEBP"
                        onDrop={handlePosterDrop}
                        onBrowse={() => fileInputRef.current?.click()}
                        disabled={uploadingPoster}
                    />
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            handlePosterDrop(file);
                        }
                        e.target.value = '';
                    }}
                />

                {uploadingPoster && (
                    <div className="add-movie__uploading">Загрузка...</div>
                )}
            </div>
        </div>
    );
};

// SubtitlesTab
const SubtitlesTab = ({ movieId, subtitles, setSubtitles }) => (
    <MovieRequiredGuard movieId={movieId}>
        <div className="add-movie__tab-content">
            <SubtitleForm
                movieId={movieId}
                subtitles={subtitles}
                onSubtitlesChange={setSubtitles}
                listTitle="Добавленные субтитры"
            />
        </div>
    </MovieRequiredGuard>
);

// DictionaryTab
const DictionaryTab = ({ movieId, words, setWords }) => (
    <MovieRequiredGuard movieId={movieId}>
        <div className="add-movie__tab-content">
            <WordForm
                movieId={movieId}
                words={words}
                onWordsChange={setWords}
            />
        </div>
    </MovieRequiredGuard>
);

//  MAIN COMPONENT
const AddMoviePage = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const routeMovieId = id ? Number(id) : null;
    const isEdit = Boolean(routeMovieId);

    const [activeTab, setActiveTab] = useState('main');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [genres, setGenres] = useState([]);
    const [savedMovieId, setSavedMovieId] = useState(routeMovieId);
    const [isMovieSaved, setIsMovieSaved] = useState(isEdit);

    const [form, setForm] = useState({
        titleOrig: '',
        titleRu: '',
        describeRu: '',
        describeEng: '',
        posterPath: '',
        country: '',
        year: String(new Date().getFullYear()),
        duration: '',
        kinopoiskRating: '',
        genreIds: [],
    });

    const [subtitles, setSubtitles] = useState([]);
    const [words, setWords] = useState([]);

    const tabs = [
        { key: 'main', label: 'Основное' },
        { key: 'subtitles', label: `Субтитры (${subtitles.length})` },
        { key: 'dictionary', label: `Словарь (${words.length})` },
    ];

    useEffect(() => {
        const init = async () => {
            try {
                setError('');

                const genresRes = await genresAPI.getGenres();
                const allGenres = Array.isArray(genresRes.data) ? genresRes.data : [];
                setGenres(allGenres);

                if (!isEdit || !routeMovieId) return;

                const movieRes = await moviesAPI.getMovie(routeMovieId);
                const movie = movieRes.data;

                const kpRating =
                    movie?.kinopoiskRating ??
                    movie?.rating?.kinopoiskRating ??
                    '';

                setForm({
                    titleOrig: movie?.titleOrig || '',
                    titleRu: movie?.titleRu || '',
                    describeRu: movie?.describeRu || '',
                    describeEng: movie?.describeEng || '',
                    posterPath: movie?.posterPath || '',
                    country: movie?.country || '',
                    year:
                        movie?.year != null
                            ? String(movie.year)
                            : String(new Date().getFullYear()),
                    duration:
                        movie?.duration != null
                            ? String(movie.duration)
                            : '',
                    kinopoiskRating:
                        kpRating !== '' && kpRating != null
                            ? String(kpRating)
                            : '',
                    genreIds: normalizeGenreIds(movie, allGenres),
                });

                const actualMovieId = movie?.movieId || routeMovieId;
                setSavedMovieId(actualMovieId);
                setIsMovieSaved(true);

                try {
                    const subtitlesRes = await adminAPI.subtitles.getByMovie(actualMovieId);
                    setSubtitles(Array.isArray(subtitlesRes.data) ? subtitlesRes.data : []);
                } catch (subErr) {
                    console.warn('Не удалось загрузить субтитры:', subErr);
                    setSubtitles([]);
                }

                try {
                    const wordsRes = await dictionaryAPI.getMovieWords(actualMovieId);
                    setWords(Array.isArray(wordsRes.data) ? wordsRes.data : []);
                } catch (wordsErr) {
                    console.warn('Не удалось загрузить слова:', wordsErr);
                    setWords([]);
                }
            } catch (err) {
                console.error(err);
                setError('Не удалось загрузить данные фильма');
            }
        };

        init();
    }, [isEdit, routeMovieId]);

    const handleSubmit = async (e) => {
        e?.preventDefault();

        if (!form.titleOrig.trim()) {
            setError('Оригинальное название обязательно');
            setActiveTab('main');
            return;
        }

        if (!isEdit && isMovieSaved) {
            setActiveTab('subtitles');
            return;
        }

        setSaving(true);
        setError('');

        try {
            const movieData = {
                titleOrig: form.titleOrig.trim(),
                titleRu: form.titleRu.trim() || null,
                describeRu: form.describeRu.trim() || null,
                describeEng: form.describeEng.trim() || null,
                posterPath: form.posterPath || null,
                country: form.country.trim() || null,
                year: form.year ? parseInt(form.year, 10) : null,
                duration: form.duration ? parseInt(form.duration, 10) : null,
                kinopoiskRating: form.kinopoiskRating
                    ? parseFloat(form.kinopoiskRating)
                    : null,
                genreIds: form.genreIds
                    .map((x) => Number(x))
                    .filter((x) => !Number.isNaN(x)),
            };

            let res;

            if (isEdit && savedMovieId) {
                res = await adminAPI.movies.update(savedMovieId, movieData);
            } else {
                res = await adminAPI.movies.create(movieData);
            }

            const newId =
                res.data?.movieId ||
                res.data?.id ||
                savedMovieId;

            setSavedMovieId(newId);
            setIsMovieSaved(true);

            if (!isEdit) {
                setActiveTab('subtitles');
            } else {
                navigate('/admin/movies');
            }
        } catch (err) {
            console.error('Submit error:', err.response?.data || err);

            const errorMsg =
                err.response?.data?.error ||
                err.response?.data?.message ||
                'Ошибка при сохранении';

            setError(errorMsg);
        } finally {
            setSaving(false);
        }
    };

    const handleSaveAll = async () => {
        if (!isMovieSaved && !isEdit) {
            await handleSubmit({ preventDefault: () => {} });
            return;
        }

        navigate('/admin/movies');
    };

    return (
        <div className="add-movie">
            <AdminPageHeader
                title={isEdit ? 'Редактировать фильм' : 'Добавить фильм'}
                subtitle={isEdit && savedMovieId ? `ID: ${savedMovieId}` : ''}
            />

            <AdminTabs
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            {error && <div className="add-movie__error-bar">{error}</div>}

            <form onSubmit={handleSubmit}>
                {activeTab === 'main' && (
                    <MainTab
                        form={form}
                        setForm={setForm}
                        genres={genres}
                    />
                )}

                {activeTab === 'subtitles' && (
                    <SubtitlesTab
                        movieId={savedMovieId}
                        subtitles={subtitles}
                        setSubtitles={setSubtitles}
                    />
                )}

                {activeTab === 'dictionary' && (
                    <DictionaryTab
                        movieId={savedMovieId}
                        words={words}
                        setWords={setWords}
                    />
                )}
            </form>

            {(activeTab === 'subtitles' || activeTab === 'dictionary') && (
                <div className="add-movie__save-row">
                    <AdminButton type="button" onClick={handleSaveAll} disabled={saving}>
                        {saving ? 'Сохранение...' : 'Завершить и сохранить'}
                    </AdminButton>
                </div>
            )}
        </div>
    );
};

export default AddMoviePage;