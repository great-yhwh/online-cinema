// src/components/SubtitleItem/SubtitleItem.jsx
import React from 'react';
import { TrashButton } from '../AdminComponents/AdminComponents';
import './SubtitleItem.css';

const ChatIconLarge = () => (
    <svg width="33" height="33" viewBox="0 0 24 24" fill="#D9D9D9">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
    </svg>
);

// subtitle: { subtitleId, subtitlePath, languageCode, format, fileName, movieTitle? }
const SubtitleItem = ({ subtitle, onDelete }) => {
    const fileName =
        subtitle.fileName ||
        subtitle.subtitlePath?.split('/').pop() ||
        'subtitle';

    return (
        <div className="subtitle-item">
            <div className="subtitle-item__icon">
                <ChatIconLarge />
            </div>

            <div className="subtitle-item__info">
                <span className="subtitle-item__name">
                    {subtitle.movieTitle
                        ? `${subtitle.movieTitle} — ${fileName}`
                        : fileName}
                </span>
                <div className="subtitle-item__meta">
                    <span>{subtitle.languageCode}</span>
                    <span>{subtitle.format || 'vtt'}</span>
                </div>
            </div>

            <TrashButton onClick={() => onDelete(subtitle.subtitleId)} />
        </div>
    );
};

export default SubtitleItem;