import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { favoritesAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import MovieCard from '../../components/MovieCard/MovieCard';
import './FavoritesPage.css';

const FavoritesPage = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/');
            return;
        }
        loadFavorites();
    }, [isAuthenticated, navigate]);

    const loadFavorites = async () => {
        try {
            const res = await favoritesAPI.getFavorites();
            setFavorites(res.data || []);
        } catch (err) {
            console.error('Failed to load favorites:', err);
        } finally {
            setLoading(false);
        }
    };

    const removeFavorite = async (movieId) => {
        try {
            await favoritesAPI.removeFavorite(movieId);
            setFavorites((prev) => prev.filter((f) => f.movieId !== movieId));
        } catch (err) {
            console.error('Failed to remove favorite:', err);
        }
    };

    if (loading) {
        return (
            <div className="favorites-page">
                <div className="favorites-page__loading">
                    <div className="favorites-page__spinner" />
                </div>
            </div>
        );
    }

    return (
        <div className="favorites-page">
            <div className="favorites-page__content">
                <h1 className="favorites-page__title">Избранное</h1>

                {favorites.length === 0 ? (
                    <div className="favorites-page__empty">
                        <p>Список избранного пуст</p>
                        <span>Добавляйте фильмы, нажимая на сердечко</span>
                    </div>
                ) : (
                    <div className="favorites-page__grid">
                        {favorites.map((fav) => (
                            <MovieCard
                                key={fav.favoriteId}
                                movie={fav}
                                variant="grid"
                                onRemove={removeFavorite}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FavoritesPage;