using CinemaAPI.DTO.Movies;
using CinemaAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace CinemaAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MoviesController : ControllerBase
{
    private readonly IMovieService _movieService;

    public MoviesController(IMovieService movieService)
    {
        _movieService = movieService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<MovieListDto>>> GetMovies(
        [FromQuery] MovieSearchParams searchParams)
    {
        var result = await _movieService.SearchMoviesAsync(searchParams);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<MovieDetailDto>> GetMovie(int id)
    {
        var movie = await _movieService.GetMovieByIdAsync(id);
        if (movie == null) return NotFound(new { message = "Фильм не найден" });
        return Ok(movie);
    }

    [HttpGet("{id}/similar")]
    public async Task<ActionResult<List<MovieListDto>>> GetSimilar(int id, [FromQuery] int count = 5)
    {
        var similar = await _movieService.GetSimilarMoviesAsync(id, count);
        return Ok(similar);
    }
}