import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { historyAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import MovieCard from '../../components/MovieCard/MovieCard';
import './HistoryPage.css';

const HistoryPage = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/');
            return;
        }
        loadHistory();
    }, [isAuthenticated, navigate]);

    const loadHistory = async () => {
        try {
            const res = await historyAPI.getHistory();
            setHistory(res.data || []);
        } catch (err) {
            console.error('Failed to load history:', err);
        } finally {
            setLoading(false);
        }
    };

    const removeFromHistory = async (movieId) => {
        try {

            setHistory((prev) => prev.filter((item) => item.movieId !== movieId));
        } catch (err) {
            console.error('Failed to remove from history:', err);
        }
    };

    const clearAllHistory = async () => {
        if (window.confirm('Очистить всю историю просмотра?')) {
            try {
                await historyAPI.clearHistory();
                setHistory([]);
            } catch (err) {
                console.error('Failed to clear history:', err);
            }
        }
    };

    if (loading) {
        return (
            <div className="history-page">
                <div className="history-page__loading">
                    <div className="history-page__spinner" />
                </div>
            </div>
        );
    }

    return (
        <div className="history-page">
            <div className="history-page__content">
                <div className="history-page__header">
                    <h1 className="history-page__title">Просмотренное</h1>
                    {history.length > 0 && (
                        <button className="history-page__clear-btn" onClick={clearAllHistory}>
                            Очистить всё
                        </button>
                    )}
                </div>

                {history.length === 0 ? (
                    <div className="history-page__empty">
                        <p>История просмотра пуста</p>
                        <span>Начните смотреть фильмы</span>
                    </div>
                ) : (
                    <div className="history-page__grid">
                        {history.map((item) => (
                            <MovieCard
                                key={item.watchHistoryId}
                                movie={item}
                                variant="history"
                                onRemove={removeFromHistory}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistoryPage;