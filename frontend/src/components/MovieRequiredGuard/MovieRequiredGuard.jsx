// src/components/MovieRequiredGuard/MovieRequiredGuard.jsx

const MovieRequiredGuard = ({ movieId, children }) => {
    if (!movieId) {
        return (
            <div className="add-movie__tab-content">
                <div className="add-movie__form-card">
                    <p className="add-movie__warning">
                        Сначала сохраните основную информацию о фильме
                        на вкладке «Основное».
                    </p>
                </div>
            </div>
        );
    }

    return children;
};

export default MovieRequiredGuard;