// src/components/Charts/ChartCard.jsx
import React from 'react';
import './ChartCard.css';

const ChartCard = ({ title, children, noData, noDataText = 'Нет данных' }) => (
    <div className="chart-card">
        <div className="chart-card__header">
            <h2 className="chart-card__title">{title}</h2>
        </div>
        <div className="chart-card__body">
            {noData ? (
                <div className="chart-card__no-data">{noDataText}</div>
            ) : (
                children
            )}
        </div>
    </div>
);

export default ChartCard;