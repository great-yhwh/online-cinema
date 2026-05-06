import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { moviesAPI, historyAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import VideoPlayer from '../../components/VideoPlayer/VideoPlayer';
import './WatchPage.css';

const WatchPage = ({ setIsVideoPlayerOpen }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [initialProgress, setInitialProgress] = useState(0);

    // Скрыть Header/Footer при монтировании
    // возвращаем при размонтировании
    useEffect(() => {
        setIsVideoPlayerOpen(true);

        return () => {
            setIsVideoPlayerOpen(false);
        };
    }, [setIsVideoPlayerOpen]);

    useEffect(() => {
        loadMovie();
    }, [id]);

    const loadMovie = async () => {
        setLoading(true);
        try {
            const res = await moviesAPI.getMovie(id);
            setMovie(res.data);

            if (isAuthenticated) {
                try {
                    const historyRes = await historyAPI.getHistory();
                    const movieHistory = historyRes.data?.find(
                        (h) => h.movieId === parseInt(id)
                    );
                    if (movieHistory && !movieHistory.completed) {
                        setInitialProgress(movieHistory.progressTime || 0);
                    }
                } catch (err) {
                    console.log('No history found');
                }
            }
        } catch (err) {
            setError('Не удалось загрузить фильм');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="watch-page">
                <div className="watch-page__loading">
                    <div className="watch-page__spinner" />
                </div>
            </div>
        );
    }

    if (error || !movie) {
        return (
            <div className="watch-page">
                <div className="watch-page__error">
                    <p>{error || 'Фильм не найден'}</p>
                    <button onClick={() => navigate(-1)}>Назад</button>
                </div>
            </div>
        );
    }

    return (
        <div className="watch-page">
            <VideoPlayer
                videoFiles={movie.videoFiles}
                subtitles={movie.subtitles || []}
                movieId={movie.movieId}
                movieTitle={movie.titleRu || movie.titleOrig}
                initialProgress={initialProgress}
                onBack={() => navigate(`/movie/${id}`)}
            />
        </div>
    );
};

export default WatchPage;