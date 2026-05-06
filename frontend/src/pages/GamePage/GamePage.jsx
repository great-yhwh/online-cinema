import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { dictionaryAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import './GamePage.css';

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const GamePage = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [pairs, setPairs] = useState([]);
    const [originals, setOriginals] = useState([]);
    const [translations, setTranslations] = useState([]);
    const [selectedOrig, setSelectedOrig] = useState(null);
    const [selectedTrans, setSelectedTrans] = useState(null);
    const [matched, setMatched] = useState(new Set());
    const [wrong, setWrong] = useState({ orig: null, trans: null });
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/');
            return;
        }
        startGame();
    }, [isAuthenticated, navigate]);

    const startGame = async () => {
        setLoading(true);
        setError('');
        setMatched(new Set());
        setScore(0);
        setGameOver(false);
        setSelectedOrig(null);
        setSelectedTrans(null);

        try {
            const res = await dictionaryAPI.getGameWords(8);
            const gamePairs = res.data.pairs;

            if (gamePairs.length < 4) {
                setError('Добавьте минимум 4 слова в словарь для игры');
                setLoading(false);
                return;
            }

            setPairs(gamePairs);
            setOriginals(shuffle(gamePairs));
            setTranslations(shuffle(gamePairs));
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка загрузки');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedOrig !== null && selectedTrans !== null) {
            const origWord = originals[selectedOrig];
            const transWord = translations[selectedTrans];

            if (origWord.wordId === transWord.wordId) {
                // Correct match
                setMatched((prev) => new Set([...prev, origWord.wordId]));
                setScore((prev) => prev + 1);
                setSelectedOrig(null);
                setSelectedTrans(null);

                if (matched.size + 1 === pairs.length) {
                    setTimeout(() => setGameOver(true), 500);
                }
            } else {
                // Wrong match
                setWrong({ orig: selectedOrig, trans: selectedTrans });
                setTimeout(() => {
                    setWrong({ orig: null, trans: null });
                    setSelectedOrig(null);
                    setSelectedTrans(null);
                }, 800);
            }
        }
    }, [matched.size, originals, pairs.length, selectedOrig, selectedTrans, translations]);

    if (loading) {
        return <div className="game-loading"><div className="game-spinner" /></div>;
    }

    if (error) {
        return (
            <div className="game-page">
                <div className="game-page__container">
                    <div className="game-page__error">
                        <p>{error}</p>
                        <Link to="/dictionary" className="game-page__back-btn">
                            Перейти в словарь
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (gameOver) {
        return (
            <div className="game-page">
                <div className="game-page__container">
                    <div className="game-page__victory">
                        <h1>🎉 Поздравляем!</h1>
                        <p>Вы нашли все {pairs.length} пар!</p>
                        <div className="game-page__victory-actions">
                            <button className="game-page__play-again" onClick={startGame}>
                                Играть снова
                            </button>
                            <Link to="/dictionary" className="game-page__back-link">
                                Вернуться в словарь
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="game-page">
            <div className="game-page__container">
                <div className="game-page__header">
                    <h1 className="game-page__title">Найди пару</h1>
                    <div className="game-page__stats">
            <span className="game-page__score">
              Найдено: {score} / {pairs.length}
            </span>
                        <button className="game-page__restart" onClick={startGame}>
                            Заново
                        </button>
                    </div>
                </div>

                <p className="game-page__hint">
                    Нажмите на английское слово слева и его перевод справа
                </p>

                <div className="game-page__board">
                    {/* Original Words (Left) */}
                    <div className="game-page__column">
                        <h3 className="game-page__column-title">English</h3>
                        {originals.map((word, index) => (
                            <button
                                key={`orig-${index}`}
                                className={`game-page__card
                  ${matched.has(word.wordId) ? 'matched' : ''}
                  ${selectedOrig === index ? 'selected' : ''}
                  ${wrong.orig === index ? 'wrong' : ''}
                `}
                                disabled={matched.has(word.wordId)}
                                onClick={() => setSelectedOrig(index)}
                            >
                                {word.wordOriginal}
                            </button>
                        ))}
                    </div>

                    {/* Translations (Right) */}
                    <div className="game-page__column">
                        <h3 className="game-page__column-title">Русский</h3>
                        {translations.map((word, index) => (
                            <button
                                key={`trans-${index}`}
                                className={`game-page__card
                  ${matched.has(word.wordId) ? 'matched' : ''}
                  ${selectedTrans === index ? 'selected' : ''}
                  ${wrong.trans === index ? 'wrong' : ''}
                `}
                                disabled={matched.has(word.wordId)}
                                onClick={() => setSelectedTrans(index)}
                            >
                                {word.translation}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GamePage;