import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AdminRoute from './components/AdminRoute';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import HomePage from './pages/HomePage/HomePage';
import MoviesPage from './pages/MoviesPage/MoviesPage';
import MovieDetailPage from './pages/MovieDetailPage/MovieDetailPage';
import FavoritesPage from './pages/FavoritesPage/FavoritesPage';
import HistoryPage from './pages/HistoryPage/HistoryPage';
import DictionaryPage from './pages/DictionaryPage/DictionaryPage';
import GamePage from './pages/GamePage/GamePage';
import WatchPage from './pages/WatchPage/WatchPage';
import ContinueWatchingPage from "./pages/ContinueWatchingPage/ContinueWatchingPage";

// Admin
import AdminLayout from './components/AdminLayout/AdminLayout';
import DashboardPage from './pages/AdminPanelPage/DashboardPage/DashboardPage';
import MoviesAdminPage from './pages/AdminPanelPage/MoviesAdminPage/MoviesAdminPage';
import AddMoviePage from './pages/AdminPanelPage/AddMoviePage/AddMoviePage';
import VideoFilesPage from './pages/AdminPanelPage/VideoFilesPage/VideoFilesPage';
import GenresAdminPage from './pages/AdminPanelPage/GenresAdminPage/GenresAdminPage';
import SubtitlesAdminPage from './pages/AdminPanelPage/SubtitlesAdminPage/SubtitlesAdminPage';
import DictionaryAdminPage from './pages/AdminPanelPage/DictionaryAdminPage/DictionaryAdminPage';
import ReportsPage from './pages/AdminPanelPage/ReportsPage/ReportsPage';

import './App.css';

function App() {
    const [isMoviesFilterOpen, setIsMoviesFilterOpen] = useState(false);
    const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);

    const hideHeaderFooter = isMoviesFilterOpen || isVideoPlayerOpen;

    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* ==================== ADMIN ROUTES (защищённые) ==================== */}
                    <Route element={<AdminRoute />}>
                        <Route path="/admin" element={<AdminLayout />}>
                            <Route index element={<DashboardPage />} />
                            <Route path="movies" element={<MoviesAdminPage />} />
                            <Route path="movies/add" element={<AddMoviePage />} />
                            <Route path="movies/edit/:id" element={<AddMoviePage />} />
                            <Route path="video-files" element={<VideoFilesPage />} />
                            <Route path="genres" element={<GenresAdminPage />} />
                            <Route path="subtitles" element={<SubtitlesAdminPage />} />
                            <Route path="dictionary" element={<DictionaryAdminPage />} />
                            <Route path="reports" element={<ReportsPage />} />
                        </Route>
                    </Route>

                    {/* ==================== PUBLIC ROUTES ==================== */}
                    <Route
                        path="*"
                        element={
                            <div className="app">
                                {!hideHeaderFooter && <Header />}

                                <main className="main-content">
                                    <Routes>
                                        <Route path="/" element={<HomePage />} />
                                        <Route
                                            path="/movies/"
                                            element={
                                                <MoviesPage
                                                    isFilterOpen={isMoviesFilterOpen}
                                                    setIsFilterOpen={setIsMoviesFilterOpen}
                                                />
                                            }
                                        />
                                        <Route path="/movie/:id" element={<MovieDetailPage />} />
                                        <Route path="/favorites" element={<FavoritesPage />} />
                                        <Route path="/history" element={<HistoryPage />} />
                                        <Route path="/continue-watching" element={<ContinueWatchingPage />} />
                                        <Route path="/dictionary" element={<DictionaryPage />} />
                                        <Route path="/game" element={<GamePage />} />
                                        <Route
                                            path="/watch/:id"
                                            element={
                                                <WatchPage
                                                    isVideoPlayerOpen={isVideoPlayerOpen}
                                                    setIsVideoPlayerOpen={setIsVideoPlayerOpen}
                                                />
                                            }
                                        />
                                    </Routes>
                                </main>

                                {!hideHeaderFooter && <Footer />}
                            </div>
                        }
                    />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;