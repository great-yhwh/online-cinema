import React, { useState, useEffect, useRef, useMemo } from 'react';
import { moviesAPI, adminAPI } from '../../../api/api';
import { useDataLoader } from '../../../hooks/useDataLoader';
import {
    AdminPageHeader,
    AdminSelect,
    AdminButton,
    DropZone,
    SectionHeader,
    TrashButton,
} from '../../../components/AdminComponents/AdminComponents';
import './VideoFilesPage.css';

const FilmIcon = ({ size = 33, color = '#D9D9D9' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="2" />
        <line x1="7" y1="2" x2="7" y2="22" />
        <line x1="17" y1="2" x2="17" y2="22" />
        <line x1="2" y1="12" x2="22" y2="12" />
    </svg>
);

const VideoFilesPage = () => {
    const fileInputRef = useRef(null);
    // eslint-disable-next-line no-unused-vars
    const [isDragOver] = useState(false);

    // Загружаем фильмы
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

    // Загружаем видеофайлы для каждого фильма
    const [videoFiles, setVideoFiles] = useState([]);
    const [filesLoading, setFilesLoading] = useState(false);
    const [filesError, setFilesError] = useState(null);

    useEffect(() => {
        if (!movies || movies.length === 0) return;

        const loadVideoFiles = async () => {
            setFilesLoading(true);
            setFilesError(null);
            try {
                const promises = movies.map(m =>
                    adminAPI.videoFiles
                        .getByMovie(m.movieId)
                        .then(res => res.data)
                        .catch(() => [])
                );
                const filesArrays = await Promise.all(promises);
                const allFiles = filesArrays.flatMap((arr, idx) =>
                    arr.map(vf => ({
                        ...vf,
                        movieTitle: movies[idx]?.titleRu || movies[idx]?.titleOrig || '',
                    }))
                );
                setVideoFiles(allFiles);
            } catch (err) {
                console.error('Ошибка загрузки видеофайлов:', err);
                setFilesError(err.message);
            } finally {
                setFilesLoading(false);
            }
        };

        loadVideoFiles();
    }, [movies]);

    // UI состояния
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState(null);
    const [form, setForm] = useState({
        quality: '360p',
        movieId: '',
        format: 'mp4',
    });

    const qualityOptions = [
        { value: '360p', label: '360p' },
        { value: '480p', label: '480p' },
        { value: '720p', label: '720p' },
        { value: '1080p', label: '1080p' },
    ];

    const formatOptions = [
        { value: 'mp4', label: 'MP4' },
        { value: 'mkv', label: 'MKV' },
        { value: 'avi', label: 'AVI' },
        { value: 'mov', label: 'MOV' },
        { value: 'webm', label: 'WebM' },
    ];

    // Установка первого фильма по умолчанию
    useEffect(() => {
        if (movies.length > 0 && !form.movieId) {
            setForm(prev => ({ ...prev, movieId: movies[0].movieId }));
        }
    }, [movies, form.movieId]);

    const handleChange = (field) => (e) =>
        setForm(prev => ({ ...prev, [field]: e.target.value }));

    const handleFileDrop = (file) => {
        setSelectedFile(file);
    };

    const handleAdd = async () => {
        if (!selectedFile) {
            alert('Выберите видеофайл');
            return;
        }
        if (!form.movieId) {
            alert('Выберите фильм');
            return;
        }

        setUploading(true);
        setUploadProgress(0);
        try {
            // Загружаем файл на сервер с отслеживанием прогресса
            const res = await adminAPI.upload.video(selectedFile, {
            });
            const uploadedPath = res.data.path;

            // Создаём запись в БД
            const payload = {
                movieId: Number(form.movieId),
                quality: form.quality,
                videoPath: uploadedPath,
                format: form.format,
            };
            const createRes = await adminAPI.videoFiles.create(payload);
            const newFile = createRes.data;
            const movie = movies.find(m => m.movieId === form.movieId);
            setVideoFiles(prev => [
                ...prev,
                {
                    ...newFile,
                    movieTitle: movie?.titleRu || movie?.titleOrig || '',
                },
            ]);

            // Сброс формы
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err) {
            alert(err.response?.data?.message || err.message || 'Ошибка при добавлении');
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleDelete = async (id) => {
        try {
            await adminAPI.videoFiles.delete(id);
            setVideoFiles(prev => prev.filter(vf => vf.videoFileId !== id));
        } catch (err) {
            console.error(err);
            alert('Ошибка при удалении');
        }
    };

    const movieOptions = movies.map(m => ({
        value: m.movieId,
        label: m.titleRu || m.titleOrig || `ID: ${m.movieId}`,
    }));

    const isLoading = moviesLoading || filesLoading;
    const error = moviesError || filesError;

    const fileCountForm = (count) => {
        const lastDigit = count % 10;
        const lastTwo = count % 100;
        if (lastTwo >= 11 && lastTwo <= 19) return 'файлов';
        if (lastDigit === 1) return 'файл';
        if (lastDigit >= 2 && lastDigit <= 4) return 'файла';
        return 'файлов';
    };

    if (isLoading) {
        return (
            <div className="video-files">
                <AdminPageHeader title="Видеофайлы" subtitle="Загрузка..." />
                <div className="video-files__loading">Загрузка...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="video-files">
                <AdminPageHeader title="Видеофайлы" subtitle="Ошибка" />
                <div className="video-files__error">
                    <p>Ошибка: {error}</p>
                    <button onClick={refetchMovies}>Повторить</button>
                </div>
            </div>
        );
    }

    return (
        <div className="video-files">
            <AdminPageHeader
                title="Видеофайлы"
                subtitle={`${videoFiles.length} ${fileCountForm(videoFiles.length)}`}
            />

            {/* Drop zone */}
            <DropZone
                text="Перетащите видеофайл сюда"
                formats="MP4, MKV, AVI, MOV, WebM"
                onDrop={handleFileDrop}
                onBrowse={() => fileInputRef.current?.click()}
                isDragOver={isDragOver}
            />
            <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                style={{ display: 'none' }}
                onChange={(e) => e.target.files[0] && handleFileDrop(e.target.files[0])}
            />

            {/* Выбранный файл */}
            {selectedFile && (
                <div className="video-files__selected-file">
                    <span>Выбран файл: {selectedFile.name}</span>
                    <button onClick={() => {
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                    }}>
                        ✕
                    </button>
                </div>
            )}

            {/* Форма */}
            <div className="video-files__form-card">
                <SectionHeader
                    icon={<FilmIcon size={18} color="#7E7E7F" />}
                    title="Добавить файл"
                />

                <div className="video-files__form-row">
                    <div style={{ width: 169 }}>
                        <AdminSelect
                            label="Фильм"
                            value={form.movieId}
                            onChange={handleChange('movieId')}
                            options={movieOptions}
                            placeholder="Выберите фильм"
                        />
                    </div>
                    <div style={{ width: 100 }}>
                        <AdminSelect
                            label="Качество"
                            value={form.quality}
                            onChange={handleChange('quality')}
                            options={qualityOptions}
                        />
                    </div>
                    <div style={{ width: 105 }}>
                        <AdminSelect
                            label="Формат"
                            value={form.format}
                            onChange={handleChange('format')}
                            options={formatOptions}
                        />
                    </div>
                </div>

                {/* Прогресс загрузки */}
                {uploading && (
                    <div className="video-files__upload-progress">
                        <div className="video-files__progress-bar" style={{ width: `${uploadProgress}%` }} />
                        <span>Загрузка: {uploadProgress}%</span>
                    </div>
                )}

                <div className="video-files__form-row-2">
                    <AdminButton onClick={handleAdd} disabled={uploading || !selectedFile}>
                        {uploading ? 'Загрузка...' : 'Добавить'}
                    </AdminButton>
                </div>
            </div>

            {/* Список файлов */}
            <div className="video-files__section">
                <h3 className="video-files__section-title">Все файлы</h3>
                <div className="video-files__list-card">
                    <div className="video-files__list">
                        {videoFiles.length === 0 ? (
                            <p className="video-files__empty">Нет видеофайлов</p>
                        ) : (
                            videoFiles.map(vf => (
                                <div key={vf.videoFileId} className="video-files__item">
                                    <div className="video-files__item-icon">
                                        <FilmIcon />
                                    </div>
                                    <div className="video-files__item-info">
                                        <span className="video-files__item-name">
                                            {vf.videoPath?.split('/').pop() || 'file.mp4'}
                                        </span>
                                        <div className="video-files__item-meta">
                                            <span>{vf.quality || '360p'}</span>
                                            <span>{vf.format || 'mp4'}</span>
                                            <span>{vf.movieTitle || ''}</span>
                                        </div>
                                    </div>
                                    <TrashButton onClick={() => handleDelete(vf.videoFileId)} />
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoFilesPage;