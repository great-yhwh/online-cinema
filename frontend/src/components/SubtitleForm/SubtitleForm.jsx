// src/components/SubtitleForm/SubtitleForm.jsx
import React, { useRef, useState } from 'react';
import { adminAPI } from '../../api/api';
import {
    AdminButton,
    AdminSelect,
    SectionHeader,
} from '../AdminComponents/AdminComponents';
import SubtitleItem from '../SubtitleItem/SubtitleItem';
import './SubtitleForm.css';

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
];

/*
 * Props:
 *   movieId        – number|null  — id фильма (если null, показываем заглушку)
 *   subtitles      – Subtitle[]   — текущий список
 *   onSubtitlesChange – (Subtitle[]) => void
 *   showList       – bool         — показывать ли список под формой (default true)
 *   listTitle      – string       — заголовок над списком
 */
const SubtitleForm = ({
                          movieId,
                          subtitles,
                          onSubtitlesChange,
                          showList = true,
                          listTitle = 'Добавленные субтитры',
                      }) => {
    const fileInputRef = useRef(null);
    const [lang, setLang] = useState('en');
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const selected = e.target.files?.[0];
        if (selected) setFile(selected);
    };

    const handleAdd = async () => {
        if (!file) {
            setError('Выберите файл субтитров');
            return;
        }

        setError('');
        setUploading(true);

        try {
            const uploadRes = await adminAPI.upload.subtitle(file);
            const subtitlePath = uploadRes.data?.path;

            if (!subtitlePath) {
                throw new Error('Сервер не вернул путь к субтитрам');
            }

            const res = await adminAPI.subtitles.create({
                movieId,
                languageCode: lang,
                subtitlePath,
                format: file.name.split('.').pop() || 'vtt',
            });

            onSubtitlesChange([...subtitles, res.data]);
            setFile(null);

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (err) {
            const serverError = err.response?.data;
            console.error('Subtitle error:', serverError || err);

            if (serverError?.errors) {
                setError(Object.values(serverError.errors).flat().join(', '));
            } else if (serverError?.message?.toLowerCase().includes('duplicate')) {
                setError('Субтитры для этого языка уже добавлены');
            } else {
                setError(
                    serverError?.message ||
                    serverError?.error ||
                    'Ошибка при добавлении'
                );
            }
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await adminAPI.subtitles.delete(id);
            onSubtitlesChange(subtitles.filter((s) => s.subtitleId !== id));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="subtitle-form">
            {/* Форма */}
            <div className="subtitle-form__card">
                <SectionHeader icon={<ChatIcon />} title="Добавить субтитры" />

                <div className="subtitle-form__row">
                    <div className="subtitle-form__lang">
                        <AdminSelect
                            label="Язык"
                            value={lang}
                            onChange={(e) => setLang(e.target.value)}
                            options={LANG_OPTIONS}
                        />
                    </div>

                    <div className="subtitle-form__file">
                        <label className="subtitle-form__file-label">
                            Файл субтитров (.vtt, .srt)
                        </label>
                        <div className="subtitle-form__file-row">
                            <AdminButton
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                style={{ padding: '0 16px', height: 38, fontSize: 16 }}
                            >
                                Выбрать файл
                            </AdminButton>

                            {file && (
                                <span className="subtitle-form__file-name">
                                    {file.name}
                                </span>
                            )}
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".vtt,.srt"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                    </div>

                    <div className="subtitle-form__actions">
                        {error && (
                            <span className="subtitle-form__error">{error}</span>
                        )}
                        <AdminButton
                            type="button"
                            onClick={handleAdd}
                            disabled={uploading}
                        >
                            {uploading ? 'Загрузка...' : 'Добавить'}
                        </AdminButton>
                    </div>
                </div>
            </div>

            {/* Список */}
            {showList && subtitles.length > 0 && (
                <div className="subtitle-form__list-section">
                    <h3 className="subtitle-form__list-title">{listTitle}</h3>
                    <div className="subtitle-form__list-card">
                        <div className="subtitle-form__list">
                            {subtitles.map((sub) => (
                                <SubtitleItem
                                    key={sub.subtitleId}
                                    subtitle={sub}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubtitleForm;