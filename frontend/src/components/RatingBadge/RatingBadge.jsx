import './RatingBadge.css';

const getRatingColor = (rating) => {
    if (rating === undefined || rating === null) return 'rgba(0, 0, 5, 0.75)';
    if (rating >= 7.0) return '#53ac74';
    if (rating >= 5.0) return '#ddab5a';
    return '#d76565';
};

const KinopoiskIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        className="rating-badge__icon"
    >
        <path
            fill="currentColor"
            d="M18.103 15.964A10.04 10.04 0 0 1 10.042 20C4.496 20 0 15.523 0 10S4.496 0 10.042 0a10.04 10.04 0 0 1 8.071 4.05L9.724 8.522 15.123 3H12.13L8.455 8.08V3h-2.43v14h2.43v-5.072L12.13 17h2.993l-5.258-5.348 8.238 4.312Z"
        />
        <path
            fill="currentColor"
            d="m20 11.294-9.237-.618 8.46 3.38A9.9 9.9 0 0 0 20 11.294ZM10.822 9.3l8.4-3.356A9.9 9.9 0 0 1 20 8.705l-9.178.595Z"
        />
    </svg>
);

const RatingBadge = ({ rating, showIcon = true, className = '' }) => {
    if (!rating) return null;

    return (
        <div
            className={`rating-badge ${className}`}
            style={{ background: getRatingColor(rating) }}
        >
            {showIcon && <KinopoiskIcon />}
            <span className="rating-badge__value">{rating}</span>
        </div>
    );
};

export default RatingBadge;