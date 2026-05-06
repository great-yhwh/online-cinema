import React, { useRef, useEffect, useState, useCallback } from 'react';
import { historyAPI, STATIC_URL } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import './VideoPlayer.css';

const VideoPlayer = ({
                         videoFiles,
                         subtitles,
                         movieId,
                         movieTitle,
                         initialProgress = 0,
                         onBack
                     }) => {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const progressRef = useRef(null);
    const hideControlsTimer = useRef(null);
    const dialogsListRef = useRef(null);
    const { isAuthenticated } = useAuth();
    const progressInterval = useRef(null);

    // Состояние плеера
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    // Субтитры
    const [enEnabled, setEnEnabled] = useState(true);
    const [ruEnabled, setRuEnabled] = useState(true);
    const [currentEnText, setCurrentEnText] = useState('');
    const [currentRuText, setCurrentRuText] = useState('');
    const [enCues, setEnCues] = useState([]);
    const [ruCues, setRuCues] = useState([]);

    // Панели
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showDialogs, setShowDialogs] = useState(false);
    const [activeQuality, setActiveQuality] = useState('auto');
    const [activeCueIndex, setActiveCueIndex] = useState(-1);

    // Объединённые диалоги
    const [mergedDialogs, setMergedDialogs] = useState([]);

    const getFullUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return `${STATIC_URL}${path}`;
    };

    const videoSrc = getFullUrl(videoFiles?.[0]?.videoPath);
    const enSub = subtitles?.find((s) => s.languageCode === 'en');
    const ruSub = subtitles?.find((s) => s.languageCode === 'ru');

    // Доступные качества из videoFiles
    const qualities = videoFiles?.map((vf, i) => ({
        label: vf.quality || (i === 0 ? 'Авто' : `Качество ${i + 1}`),
        value: vf.quality || 'auto',
        src: getFullUrl(vf.videoPath)
    })) || [];

    // ==================== VTT ПАРСЕР ====================
    const parseTimestamp = (ts) => {
        if (!ts) return NaN;
        ts = ts.replace(',', '.').trim();
        const parts = ts.split(':');
        if (parts.length === 3) {
            return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2]);
        } else if (parts.length === 2) {
            return parseInt(parts[0]) * 60 + parseFloat(parts[1]);
        }
        return NaN;
    };

    const parseVTT = useCallback((text) => {
        const cues = [];
        const blocks = text.trim().split(/\n\s*\n/);
        for (const block of blocks) {
            const lines = block.trim().split('\n');
            for (let i = 0; i < lines.length; i++) {
                const match = lines[i].match(/([\d:.,]+)\s*-->\s*([\d:.,]+)/);
                if (match) {
                    const start = parseTimestamp(match[1]);
                    const end = parseTimestamp(match[2]);
                    const textContent = lines.slice(i + 1).join('\n').trim();
                    if (textContent && !isNaN(start) && !isNaN(end) && end > start) {
                        cues.push({ start, end, text: textContent });
                    }
                    break;
                }
            }
        }
        return cues.sort((a, b) => a.start - b.start);
    }, []);

    // ==================== ЗАГРУЗКА СУБТИТРОВ ====================
    useEffect(() => {
        const loadSubs = async () => {
            let loadedEn = [];
            let loadedRu = [];

            if (enSub) {
                try {
                    const res = await fetch(getFullUrl(enSub.subtitlePath));
                    if (res.ok) {
                        const text = await res.text();
                        loadedEn = parseVTT(text);
                        setEnCues(loadedEn);
                        console.log(`EN: ${loadedEn.length} cues`);
                    }
                } catch (e) {
                    console.error('EN sub error:', e);
                }
            }
            if (ruSub) {
                try {
                    const res = await fetch(getFullUrl(ruSub.subtitlePath));
                    if (res.ok) {
                        const text = await res.text();
                        loadedRu = parseVTT(text);
                        setRuCues(loadedRu);
                        console.log(`RU: ${loadedRu.length} cues`);
                    }
                } catch (e) {
                    console.error('RU sub error:', e);
                }
            }

            // Объединяем диалоги
            buildMergedDialogs(loadedEn, loadedRu);
        };
        loadSubs();
    }, [enSub, ruSub, parseVTT]);

    // ==================== ОБЪЕДИНЕНИЕ ДИАЛОГОВ ====================
    const buildMergedDialogs = (en, ru) => {
        const merged = [];

        // Берём EN как основу, находим совпадающий RU
        const usedRu = new Set();

        for (let i = 0; i < en.length; i++) {
            const enCue = en[i];
            // Ищем RU cue, который пересекается по времени
            let bestRu = null;
            let bestOverlap = 0;

            for (let j = 0; j < ru.length; j++) {
                if (usedRu.has(j)) continue;
                const ruCue = ru[j];
                const overlapStart = Math.max(enCue.start, ruCue.start);
                const overlapEnd = Math.min(enCue.end, ruCue.end);
                const overlap = overlapEnd - overlapStart;

                if (overlap > bestOverlap) {
                    bestOverlap = overlap;
                    bestRu = { index: j, cue: ruCue };
                }
            }

            merged.push({
                start: enCue.start,
                end: enCue.end,
                en: cleanText(enCue.text),
                ru: bestRu && bestOverlap > 0 ? cleanText(bestRu.cue.text) : '',
            });

            if (bestRu && bestOverlap > 0) {
                usedRu.add(bestRu.index);
            }
        }

        // Добавляем RU cues без EN пары
        for (let j = 0; j < ru.length; j++) {
            if (!usedRu.has(j)) {
                merged.push({
                    start: ru[j].start,
                    end: ru[j].end,
                    en: '',
                    ru: cleanText(ru[j].text),
                });
            }
        }

        merged.sort((a, b) => a.start - b.start);
        setMergedDialogs(merged);
    };

    // ==================== ПОИСК CUE ====================
    const findCue = useCallback((cues, time) => {
        for (let i = 0; i < cues.length; i++) {
            if (time >= cues[i].start && time <= cues[i].end) {
                return cues[i].text;
            }
            if (cues[i].start > time) break;
        }
        return '';
    }, []);

    // ==================== ОБНОВЛЕНИЕ СУБТИТРОВ ====================
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        let animId;
        const tick = () => {
            const t = video.currentTime;
            setCurrentEnText(enEnabled && enCues.length > 0 ? findCue(enCues, t) : '');
            setCurrentRuText(ruEnabled && ruCues.length > 0 ? findCue(ruCues, t) : '');
            animId = requestAnimationFrame(tick);
        };
        animId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(animId);
    }, [enCues, ruCues, enEnabled, ruEnabled, findCue]);

    // ==================== АВТОСКРОЛЛ ДИАЛОГОВ ====================
    useEffect(() => {
        if (!showDialogs || mergedDialogs.length === 0) return;

        let newIndex = -1;
        for (let i = 0; i < mergedDialogs.length; i++) {
            if (currentTime >= mergedDialogs[i].start && currentTime <= mergedDialogs[i].end) {
                newIndex = i;
                break;
            }
            if (mergedDialogs[i].start > currentTime) break;
        }

        if (newIndex !== activeCueIndex && newIndex >= 0) {
            setActiveCueIndex(newIndex);

            // Автоскролл к активному элементу
            const list = dialogsListRef.current;
            if (list) {
                const activeEl = list.children[newIndex];
                if (activeEl) {
                    activeEl.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
            }
        }
    }, [currentTime, showDialogs, mergedDialogs, activeCueIndex]);

    // ==================== ВИДЕО СОБЫТИЯ ====================
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onTimeUpdate = () => setCurrentTime(video.currentTime);
        const onDurationChange = () => setDuration(video.duration || 0);
        const onWaiting = () => setIsLoading(true);
        const onCanPlay = () => setIsLoading(false);
        const onLoadedData = () => {
            setIsLoading(false);
            setDuration(video.duration || 0);
            if (initialProgress > 0) video.currentTime = initialProgress;
        };

        video.addEventListener('play', onPlay);
        video.addEventListener('pause', onPause);
        video.addEventListener('timeupdate', onTimeUpdate);
        video.addEventListener('durationchange', onDurationChange);
        video.addEventListener('waiting', onWaiting);
        video.addEventListener('canplay', onCanPlay);
        video.addEventListener('loadeddata', onLoadedData);

        return () => {
            video.removeEventListener('play', onPlay);
            video.removeEventListener('pause', onPause);
            video.removeEventListener('timeupdate', onTimeUpdate);
            video.removeEventListener('durationchange', onDurationChange);
            video.removeEventListener('waiting', onWaiting);
            video.removeEventListener('canplay', onCanPlay);
            video.removeEventListener('loadeddata', onLoadedData);
        };
    }, [initialProgress]);

    // ==================== АВТО-СКРЫТИЕ КОНТРОЛОВ ====================
    const resetHideTimer = useCallback(() => {
        setShowControls(true);
        clearTimeout(hideControlsTimer.current);
        if (isPlaying) {
            hideControlsTimer.current = setTimeout(() => {
                setShowControls(false);
            }, 3000);
        }
    }, [isPlaying]);

    useEffect(() => {
        if (!isPlaying) {
            setShowControls(true);
            clearTimeout(hideControlsTimer.current);
        } else {
            resetHideTimer();
        }
    }, [isPlaying, resetHideTimer]);

    // ==================== КЛАВИАТУРА ====================
    useEffect(() => {
        const handleKey = (e) => {
            const video = videoRef.current;
            if (!video) return;

            switch (e.key) {
                case ' ':
                case 'k':
                    e.preventDefault();
                    video.paused ? video.play() : video.pause();
                    resetHideTimer();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    video.currentTime = Math.max(0, video.currentTime - 5);
                    resetHideTimer();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    video.currentTime = Math.min(duration, video.currentTime + 5);
                    resetHideTimer();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    video.volume = Math.min(1, video.volume + 0.1);
                    setVolume(video.volume);
                    resetHideTimer();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    video.volume = Math.max(0, video.volume - 0.1);
                    setVolume(video.volume);
                    resetHideTimer();
                    break;
                case 'f':
                    e.preventDefault();
                    toggleFullscreen();
                    break;
                case 'm':
                    e.preventDefault();
                    toggleMute();
                    break;
                case 'd':
                    e.preventDefault();
                    setShowDialogs(prev => !prev);
                    break;
                case 'Escape':
                    if (showDialogs) setShowDialogs(false);
                    else if (showSettings) setShowSettings(false);
                    else if (isFullscreen) document.exitFullscreen();
                    break;
                default:
                    break;
            }
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [duration, isFullscreen, showDialogs, showSettings, resetHideTimer]);

    // ==================== FULLSCREEN ====================
    useEffect(() => {
        const onChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', onChange);
        return () => document.removeEventListener('fullscreenchange', onChange);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    // ==================== КОНТРОЛЫ ====================
    const togglePlay = () => {
        const video = videoRef.current;
        if (!video) return;
        video.paused ? video.play() : video.pause();
        resetHideTimer();
    };

    const skip = (seconds) => {
        const video = videoRef.current;
        if (!video) return;
        video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
        resetHideTimer();
    };

    const toggleMute = () => {
        const video = videoRef.current;
        if (!video) return;
        video.muted = !video.muted;
        setIsMuted(video.muted);
        resetHideTimer();
    };

    const handleVolumeChange = (e) => {
        const video = videoRef.current;
        if (!video) return;
        const val = parseFloat(e.target.value);
        video.volume = val;
        video.muted = val === 0;
        setVolume(val);
        setIsMuted(val === 0);
    };

    const handleProgressClick = (e) => {
        const video = videoRef.current;
        const bar = progressRef.current;
        if (!video || !bar) return;
        const rect = bar.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        video.currentTime = pos * duration;
        resetHideTimer();
    };

    const handleQualityChange = (quality) => {
        const video = videoRef.current;
        if (!video) return;

        const file = videoFiles?.find(vf => (vf.quality || 'auto') === quality);
        if (file) {
            const currentTime = video.currentTime;
            const wasPlaying = !video.paused;
            video.src = getFullUrl(file.videoPath);
            video.currentTime = currentTime;
            if (wasPlaying) video.play();
            setActiveQuality(quality);
        }
        setShowSettings(false);
    };

    const seekToTime = (time) => {
        const video = videoRef.current;
        if (!video) return;
        video.currentTime = time;
        if (video.paused) video.play();
        resetHideTimer();
    };

    // ==================== ФОРМАТ ====================
    const formatTime = (seconds) => {
        if (isNaN(seconds) || seconds < 0) return '00:00:00';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const formatTimeShort = (seconds) => {
        if (isNaN(seconds) || seconds < 0) return '0:00';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const formatRemaining = () => {
        const remaining = duration - currentTime;
        if (isNaN(remaining) || remaining <= 0) return '';
        const h = Math.floor(remaining / 3600);
        const m = Math.floor((remaining % 3600) / 60);
        if (h > 0) return `осталось ${h} час ${m} мин`;
        return `осталось ${m} мин`;
    };

    const cleanText = (text) => {
        return text
            .replace(/<\/?[^>]+(>|$)/g, '')
            .replace(/&[a-z]+;/g, '')
            .trim();
    };

    // ==================== ПРОГРЕСС ИСТОРИИ ====================
    useEffect(() => {
        if (!isAuthenticated) return;
        progressInterval.current = setInterval(() => {
            const video = videoRef.current;
            if (video && !video.paused) {
                const ct = Math.floor(video.currentTime);
                const dur = Math.floor(video.duration || 0);
                const completed = dur > 0 && ct >= dur - 10;
                historyAPI.updateProgress(movieId, ct, completed).catch(() => {});
            }
        }, 30000);
        return () => clearInterval(progressInterval.current);
    }, [isAuthenticated, movieId]);

    const handleEnded = () => {
        if (isAuthenticated) {
            historyAPI.updateProgress(movieId, 0, true).catch(() => {});
        }
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    if (!videoSrc) {
        return (
            <div className="cp" ref={containerRef}>
                <div className="cp__no-video">Видео недоступно</div>
            </div>
        );
    }

    return (
        <div
            className={`cp ${showControls ? 'cp--show-controls' : ''} ${showDialogs ? 'cp--dialogs-open' : ''}`}
            ref={containerRef}
            onMouseMove={resetHideTimer}
            onClick={(e) => {
                if (e.target === videoRef.current || e.target.classList.contains('cp__subtitles-area')) {
                    togglePlay();
                }
            }}
        >
            {/* Видео */}
            <video
                ref={videoRef}
                className="cp__video"
                crossOrigin="anonymous"
                onEnded={handleEnded}
                preload="auto"
            >
                <source src={videoSrc} type="video/mp4" />
            </video>

            {/* Спиннер */}
            {isLoading && (
                <div className="cp__loader">
                    <div className="cp__loader-spinner" />
                </div>
            )}

            {/* Верх — название */}
            <div className="cp__top">
                <button className="cp__back-btn" onClick={onBack}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="cp__title">{movieTitle}</h1>
            </div>

            {/* Субтитры */}
            <div className="cp__subtitles-area">
                {currentEnText && (
                    <div className="cp__subtitle cp__subtitle--en">
                        {cleanText(currentEnText).split('\n').map((line, i) => (
                            <React.Fragment key={i}>
                                {line}{i < cleanText(currentEnText).split('\n').length - 1 && <br />}
                            </React.Fragment>
                        ))}
                    </div>
                )}
                {currentRuText && (
                    <div className="cp__subtitle cp__subtitle--ru">
                        {cleanText(currentRuText).split('\n').map((line, i) => (
                            <React.Fragment key={i}>
                                {line}{i < cleanText(currentRuText).split('\n').length - 1 && <br />}
                            </React.Fragment>
                        ))}
                    </div>
                )}
            </div>

            {/* Нижняя панель */}
            <div className="cp__bottom">
                {/* Прогресс */}
                <div className="cp__progress-row">
                    <span className="cp__time">{formatTime(currentTime)} / {formatTime(duration)}</span>
                    <div className="cp__progress-bar" ref={progressRef} onClick={handleProgressClick}>
                        <div className="cp__progress-bg" />
                        <div className="cp__progress-filled" style={{ width: `${progress}%` }} />
                        <div className="cp__progress-thumb" style={{ left: `${progress}%` }} />
                    </div>
                    <span className="cp__remaining">{formatRemaining()}</span>
                </div>

                {/* Кнопки */}
                <div className="cp__controls">
                    <div className="cp__controls-left">
                        <button
                            className={`cp__sub-toggle ${enEnabled ? 'cp__sub-toggle--active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); setEnEnabled(!enEnabled); }}
                        >EN</button>
                        <button
                            className={`cp__sub-toggle ${ruEnabled ? 'cp__sub-toggle--active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); setRuEnabled(!ruEnabled); }}
                        >РУ</button>

                        {/* Громкость */}
                        <div className="cp__volume-wrapper"
                             onMouseEnter={() => setShowVolumeSlider(true)}
                             onMouseLeave={() => setShowVolumeSlider(false)}
                        >
                            <button className="cp__btn" onClick={(e) => { e.stopPropagation(); toggleMute(); }}>
                                {isMuted || volume === 0 ? (
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                                    </svg>
                                ) : volume < 0.5 ? (
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
                                    </svg>
                                ) : (
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                                    </svg>
                                )}
                            </button>
                            {showVolumeSlider && (
                                <div className="cp__volume-slider" onClick={(e) => e.stopPropagation()}>
                                    <input type="range" min="0" max="1" step="0.05"
                                           value={isMuted ? 0 : volume}
                                           onChange={handleVolumeChange}
                                           className="cp__volume-input"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="cp__controls-center">
                        <button className="cp__btn" onClick={(e) => { e.stopPropagation(); skip(-5); }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                            </svg>
                            <span className="cp__skip-label">5</span>
                        </button>

                        <button className="cp__btn cp__btn--play" onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
                            {isPlaying ? (
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                                </svg>
                            ) : (
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            )}
                        </button>

                        <button className="cp__btn" onClick={(e) => { e.stopPropagation(); skip(5); }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z" />
                            </svg>
                            <span className="cp__skip-label">5</span>
                        </button>
                    </div>

                    <div className="cp__controls-right">
                        {/* Настройки */}
                        <div className="cp__settings-wrapper">
                            <button className="cp__btn" onClick={(e) => {
                                e.stopPropagation();
                                setShowSettings(!showSettings);
                                setShowDialogs(false);
                            }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                                </svg>
                            </button>

                            {/* Меню настроек */}
                            {showSettings && (
                                <div className="cp__settings-menu" onClick={(e) => e.stopPropagation()}>
                                    <div className="cp__settings-title">Качество</div>
                                    {qualities.length > 0 ? (
                                        qualities.map((q) => (
                                            <button
                                                key={q.value}
                                                className={`cp__settings-option ${activeQuality === q.value ? 'cp__settings-option--active' : ''}`}
                                                onClick={() => handleQualityChange(q.value)}
                                            >
                                                {activeQuality === q.value && (
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                                    </svg>
                                                )}
                                                <span>{q.label}</span>
                                            </button>
                                        ))
                                    ) : (
                                        <button className="cp__settings-option cp__settings-option--active">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                            </svg>
                                            <span>Авто</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Фуллскрин */}
                        <button className="cp__btn" onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}>
                            {isFullscreen ? (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                                </svg>
                            ) : (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                                </svg>
                            )}
                        </button>

                        {/* Кнопка диалогов */}
                        <button
                            className={`cp__btn ${showDialogs ? 'cp__btn--active' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowDialogs(!showDialogs);
                                setShowSettings(false);
                            }}
                            title="Показать диалоги (D)"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
                                <path d="M7 9h10v2H7zm0-3h10v2H7zm0 6h7v2H7z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* ==================== ПАНЕЛЬ ДИАЛОГОВ ==================== */}
            <div className={`cp__dialogs ${showDialogs ? 'cp__dialogs--open' : ''}`}>
                <div className="cp__dialogs-header">
                    <h3 className="cp__dialogs-title">Диалоги</h3>
                    <button className="cp__dialogs-close" onClick={() => setShowDialogs(false)}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                        </svg>
                    </button>
                </div>

                <div className="cp__dialogs-list" ref={dialogsListRef}>
                    {mergedDialogs.map((dialog, index) => (
                        <button
                            key={index}
                            className={`cp__dialog-item ${index === activeCueIndex ? 'cp__dialog-item--active' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                seekToTime(dialog.start);
                            }}
                        >
                            <span className="cp__dialog-time">
                                {formatTimeShort(dialog.start)}
                            </span>
                            <div className="cp__dialog-texts">
                                {dialog.en && (
                                    <p className="cp__dialog-en">{dialog.en}</p>
                                )}
                                {dialog.ru && (
                                    <p className="cp__dialog-ru">{dialog.ru}</p>
                                )}
                            </div>
                        </button>
                    ))}

                    {mergedDialogs.length === 0 && (
                        <div className="cp__dialogs-empty">
                            Субтитры не загружены
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;