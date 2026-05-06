using CinemaAPI.Data;
using CinemaAPI.DTO.Movies;
using CinemaAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace CinemaAPI.Services;

public class MovieService : IMovieService
{
    private readonly CinemaDbContext _db;

    public MovieService(CinemaDbContext db)
    {
        _db = db;
    }

    public async Task<PagedResult<MovieListDto>> SearchMoviesAsync(MovieSearchParams p)
    {
        var query = _db.Movies
            .Include(m => m.Rating)
            .Include(m => m.MovieGenres).ThenInclude(mg => mg.Genre)
            .Include(m => m.Subtitles)
            .AsQueryable();

        // Поиск
        if (!string.IsNullOrWhiteSpace(p.Query))
        {
            var q = p.Query.ToLower();
            query = query.Where(m =>
                m.TitleOrig.ToLower().Contains(q) ||
                (m.TitleRu != null && m.TitleRu.ToLower().Contains(q)));
        }

        // Фильтры
        if (p.GenreId.HasValue)
            query = query.Where(m => m.MovieGenres.Any(mg => mg.GenreId == p.GenreId));

        if (!string.IsNullOrWhiteSpace(p.Country))
            query = query.Where(m => m.Country == p.Country);

        if (p.YearFrom.HasValue)
            query = query.Where(m => m.Year >= p.YearFrom);

        if (p.YearTo.HasValue)
            query = query.Where(m => m.Year <= p.YearTo);

        // Сортировка
        query = (p.SortBy?.ToLower(), p.SortOrder?.ToLower()) switch
        {
            ("year", "asc") => query.OrderBy(m => m.Year),
            ("year", _) => query.OrderByDescending(m => m.Year),
            ("rating", "asc") => query.OrderBy(m =>
                m.Rating != null ? m.Rating.KinopoiskRating : 0),
            ("rating", _) => query.OrderByDescending(m =>
                m.Rating != null ? m.Rating.KinopoiskRating : 0),
            ("title", "desc") => query.OrderByDescending(m => m.TitleOrig),
            ("title", _) => query.OrderBy(m => m.TitleOrig),
            _ => query.OrderBy(m => m.MovieId)
        };

        var totalCount = await query.CountAsync();

        var items = await query
            .Skip((p.Page - 1) * p.PageSize)
            .Take(p.PageSize)
            .Select(m => ToListDto(m))
            .ToListAsync();

        return new PagedResult<MovieListDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = p.Page,
            PageSize = p.PageSize
        };
    }

    public async Task<MovieDetailDto?> GetMovieByIdAsync(int movieId)
    {
        var movie = await _db.Movies
            .Include(m => m.Rating)
            .Include(m => m.MovieGenres).ThenInclude(mg => mg.Genre)
            .Include(m => m.VideoFiles)
            .Include(m => m.Subtitles)
            .FirstOrDefaultAsync(m => m.MovieId == movieId);

        if (movie == null) return null;

        var wordsCount = await _db.MovieWords.CountAsync(mw => mw.MovieId == movieId);
        var similar = await GetSimilarMoviesAsync(movieId);

        return new MovieDetailDto
        {
            MovieId = movie.MovieId,
            TitleOrig = movie.TitleOrig,
            TitleRu = movie.TitleRu,
            DescribeRu = movie.DescribeRu,
            DescribeEng = movie.DescribeEng,
            PosterPath = movie.PosterPath,
            Country = movie.Country,
            Year = movie.Year,
            Duration = movie.Duration,
            KinopoiskRating = movie.Rating?.KinopoiskRating,
            Genres = movie.MovieGenres.Select(mg => mg.Genre.Name).ToList(),
            VideoFiles = movie.VideoFiles.Select(vf => new VideoFileDto
            {
                VideoFileId = vf.VideoFileId,
                Quality = vf.Quality,
                VideoPath = vf.VideoPath,
                Format = vf.Format
            }).ToList(),
            Subtitles = movie.Subtitles.Select(s => new SubtitleDto
            {
                SubtitleId = s.SubtitleId,
                LanguageCode = s.LanguageCode,
                SubtitlePath = s.SubtitlePath,
                Format = s.Format
            }).ToList(),
            SimilarMovies = similar,
            WordsCount = wordsCount
        };
    }

    public async Task<List<MovieListDto>> GetSimilarMoviesAsync(int movieId, int count = 5)
    {
        var genreIds = await _db.MovieGenres
            .Where(mg => mg.MovieId == movieId)
            .Select(mg => mg.GenreId)
            .ToListAsync();

        return await _db.Movies
            .Include(m => m.Rating)
            .Include(m => m.MovieGenres).ThenInclude(mg => mg.Genre)
            .Include(m => m.Subtitles)
            .Where(m => m.MovieId != movieId &&
                        m.MovieGenres.Any(mg => genreIds.Contains(mg.GenreId)))
            .OrderByDescending(m =>
                m.MovieGenres.Count(mg => genreIds.Contains(mg.GenreId)))
            .Take(count)
            .Select(m => ToListDto(m))
            .ToListAsync();
    }

    private static MovieListDto ToListDto(Movie m) => new()
    {
        MovieId = m.MovieId,
        TitleOrig = m.TitleOrig,
        TitleRu = m.TitleRu,
        PosterPath = m.PosterPath,
        Country = m.Country,
        Year = m.Year,
        Duration = m.Duration,
        KinopoiskRating = m.Rating?.KinopoiskRating,
        Genres = m.MovieGenres.Select(mg => mg.Genre.Name).ToList(),
        SubtitleLanguages = m.Subtitles.Select(s => s.LanguageCode).ToList()
    };
}