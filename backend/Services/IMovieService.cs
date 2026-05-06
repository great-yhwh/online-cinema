using CinemaAPI.DTO.Movies;

namespace CinemaAPI.Services;

public interface IMovieService
{
    Task<PagedResult<MovieListDto>> SearchMoviesAsync(MovieSearchParams searchParams);
    Task<MovieDetailDto?> GetMovieByIdAsync(int movieId);
    Task<List<MovieListDto>> GetSimilarMoviesAsync(int movieId, int count = 5);
}