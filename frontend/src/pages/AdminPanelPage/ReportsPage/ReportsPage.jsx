import React, { useMemo, useState, useEffect } from 'react';
import { moviesAPI, genresAPI, adminAPI, dictionaryAPI } from '../../../api/api';
import { useDataLoader } from '../../../hooks/useDataLoader';
import { AdminPageHeader } from '../../../components/AdminComponents/AdminComponents';
import {
    ChartCard,
    SimpleBarChart,
    SimplePieChart,
    SimpleLineChart,
    SimpleAreaChart,
    GENRE_COLORS,
} from '../../../components/Charts';
import './ReportsPage.css';

const groupWordsByDay = (words) => {
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const today = new Date();
    const result = [];

    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        result.push({
            date: d.toISOString().split('T')[0],
            day: days[d.getDay()],
            words: 0,
        });
    }

    words.forEach((word) => {
        const added = word.addedAt ? new Date(word.addedAt) : null;
        if (added && !isNaN(added)) {
            const dateKey = added.toISOString().split('T')[0];
            const entry = result.find((e) => e.date === dateKey);
            if (entry) entry.words += 1;
        }
    });

    return result.map(({ day, words }) => ({ day, words }));
};

const VISITS_MOCK = [
    { day: 'Пн', visits: 1200 },
    { day: 'Вт', visits: 1800 },
    { day: 'Ср', visits: 1500 },
    { day: 'Чт', visits: 2100 },
    { day: 'Пт', visits: 2800 },
    { day: 'Сб', visits: 3500 },
    { day: 'Вс', visits: 3100 },
];

const ReportsPage = () => {
    const baseQueries = useMemo(() => [
        {
            key: 'movies',
            fetcher: () => moviesAPI.getMovies({}),
            normalize: true,
            normalizeKeys: ['movies', 'items', 'data'],
        },
        {
            key: 'genres',
            fetcher: () => genresAPI.getGenres(),
            normalize: true,
            normalizeKeys: ['genres', 'items', 'data'],
        },
    ], []);

    const {
        movies: rawMovies,
        isLoading: baseLoading,
        error: baseError,
    } = useDataLoader(baseQueries);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const movies = rawMovies || [];

    const [metrics, setMetrics] = useState({});
    const [metricsLoading, setMetricsLoading] = useState(false);
    const [userWords, setUserWords] = useState([]);
    const [wordsLoading, setWordsLoading] = useState(false);

    useEffect(() => {
        if (!movies.length) return;

        const loadMetrics = async () => {
            setMetricsLoading(true);
            try {
                const results = await Promise.all(
                    movies.map((movie) =>
                        adminAPI.videoFiles
                            .getByMovie(movie.movieId)
                            .then((res) => ({
                                movieId: movie.movieId,
                                videoCount: Array.isArray(res.data)
                                    ? res.data.length
                                    : 0,
                            }))
                            .catch(() => ({
                                movieId: movie.movieId,
                                videoCount: 0,
                            }))
                    )
                );

                const map = {};
                results.forEach(({ movieId, videoCount }) => {
                    map[movieId] = { videoCount };
                });
                setMetrics(map);
            } catch (err) {
                console.error('Ошибка загрузки метрик:', err);
            } finally {
                setMetricsLoading(false);
            }
        };

        loadMetrics();
    }, [movies]);

    useEffect(() => {
        const loadWords = async () => {
            setWordsLoading(true);
            try {
                const res = await dictionaryAPI.getMyDictionary();
                const words = Array.isArray(res.data)
                    ? res.data
                    : res.data?.words || [];
                setUserWords(words);
            } catch (err) {
                console.error('Ошибка загрузки слов:', err);
                setUserWords([]);
            } finally {
                setWordsLoading(false);
            }
        };
        loadWords();
    }, []);

    const viewsData = useMemo(() => {
        if (!movies.length) return [];
        return movies
            .map((movie) => {
                const { videoCount = 0 } = metrics[movie.movieId] || {};
                const short = (
                    movie.titleRu ||
                    movie.titleOrig ||
                    'Без названия'
                ).slice(0, 15);
                return {
                    name: short + (short.length >= 15 ? '…' : ''),
                    views: videoCount,
                    fullName: movie.titleRu || movie.titleOrig || '',
                };
            })
            .sort((a, b) => b.views - a.views)
            .slice(0, 7);
    }, [movies, metrics]);

    const genresData = useMemo(() => {
        if (!movies.length) return [];

        const counts = {};
        movies.forEach((movie) => {
            (movie.genres || []).forEach((name) => {
                counts[name] = (counts[name] || 0) + 1;
            });
        });

        return Object.entries(counts)
            .map(([name, value], i) => ({
                name,
                value,
                color: GENRE_COLORS[i % GENRE_COLORS.length],
            }))
            .filter((item) => item.value > 0)
            .sort((a, b) => b.value - a.value);
    }, [movies]);

    const learningData = useMemo(
        () => (userWords.length ? groupWordsByDay(userWords) : []),
        [userWords]
    );

    const isLoading = baseLoading || metricsLoading || wordsLoading;

    if (baseError) {
        return (
            <div className="reports">
                <AdminPageHeader
                    title="Аналитика и отчёты"
                    subtitle="Ошибка"
                />
                <div className="reports__error">Ошибка загрузки данных</div>
            </div>
        );
    }

    return (
        <div className="reports">
            <AdminPageHeader
                title="Аналитика и отчёты"
                subtitle="Графики и статистика по платформе"
            />

            {isLoading ? (
                <div className="reports__loading">Загрузка отчётов...</div>
            ) : (
                <div className="reports__grid">
                    <ChartCard
                        title="Видеофайлы по фильмам"
                        noData={!viewsData.length}
                        noDataText="Нет данных о фильмах"
                    >
                        <SimpleBarChart
                            data={viewsData}
                            xKey="name"
                            barKey="views"
                            barName="Видеофайлов"
                            xAngle={-20}
                            tooltipLabelKey="fullName"
                        />
                    </ChartCard>

                    <ChartCard
                        title="Фильмы по жанрам"
                        noData={!genresData.length}
                        noDataText="Нет данных о жанрах"
                    >
                        <SimplePieChart data={genresData} />
                    </ChartCard>

                    <ChartCard title="Посещаемость платформы (preview)">
                        <SimpleLineChart
                            data={VISITS_MOCK}
                            lineKey="visits"
                            lineName="Визиты"
                        />
                    </ChartCard>

                    <ChartCard
                        title="Активность добавления слов"
                        noData={!learningData.length}
                        noDataText="Нет данных об изучении слов"
                    >
                        <SimpleAreaChart
                            data={learningData}
                            areaKey="words"
                            areaName="Выучено слов"
                            gradientId="colorWords"
                        />
                    </ChartCard>
                </div>
            )}
        </div>
    );
};

export default ReportsPage;