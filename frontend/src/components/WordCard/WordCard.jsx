// src/components/WordCard/WordCard.jsx
import React from 'react';
import { TrashButton } from '../AdminComponents/AdminComponents';
import './WordCard.css';

// word: { wordId?, movieWordId?, wordOriginal, translation }
const WordCard = ({ word, onDelete }) => {
    const id = word.wordId || word.movieWordId;

    return (
        <div className="word-card">
            <div className="word-card__texts">
                <span className="word-card__en">{word.wordOriginal}</span>
                <span className="word-card__ru">{word.translation}</span>
            </div>

            {onDelete && (
                <div className="word-card__actions">
                    <TrashButton onClick={() => onDelete(id)} />
                </div>
            )}
        </div>
    );
};

export default WordCard;