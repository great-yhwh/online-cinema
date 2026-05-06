using CinemaAPI.Data;
using CinemaAPI.DTO.Favorites;
using CinemaAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace CinemaAPI.Services;

public class FavoriteService : IFavoriteService
{
    private readonly CinemaDbContext _db;

    public FavoriteService(CinemaDbContext db)
    {
        _db = db;
    }

    public async Task<List<FavoriteDto>> GetUserFavoritesAsync(int userId)
    {
        return await _db.Favorites
            .Where(f => f.UserId == userId)
            .Include(f => f.Movie)
                .ThenInclude(m => m.MovieGenres)
                    .ThenInclude(mg => mg.Genre)
            .OrderByDescending(f => f.AddedAt)
            .Select(f => new FavoriteDto
            {
                FavoriteId = f.FavoriteId,
                MovieId = f.MovieId,
                TitleOrig = f.Movie.TitleOrig,
                TitleRu = f.Movie.TitleRu,
                PosterPath = f.Movie.PosterPath,
                Year = f.Movie.Year,
                Genres = f.Movie.MovieGenres.Select(mg => mg.Genre.Name).ToList(),
                AddedAt = f.AddedAt,
                KinopoiskRating = f.Movie.Rating == null ? null : f.Movie.Rating.KinopoiskRating
            })
            .ToListAsync();
    }

    public async Task<FavoriteDto> AddToFavoritesAsync(int userId, int movieId)
    {
        // Загружаем фильм с жанрами
        var movie = await _db.Movies
            .Include(m => m.MovieGenres)
                .ThenInclude(mg => mg.Genre)
            .FirstOrDefaultAsync(m => m.MovieId == movieId)
            ?? throw new InvalidOperationException("Фильм не найден");

        if (await _db.Favorites.AnyAsync(f => f.UserId == userId && f.MovieId == movieId))
            throw new InvalidOperationException("Фильм уже в избранном");

        var favorite = new Favorite
        {
            UserId = userId,
            MovieId = movieId,
            AddedAt = DateTime.UtcNow
        };

        _db.Favorites.Add(favorite);
        await _db.SaveChangesAsync();

        return new FavoriteDto
        {
            FavoriteId = favorite.FavoriteId,
            MovieId = movieId,
            TitleOrig = movie.TitleOrig,
            TitleRu = movie.TitleRu,
            PosterPath = movie.PosterPath,
            Year = movie.Year,
            Genres = movie.MovieGenres.Select(mg => mg.Genre.Name).ToList(),
            AddedAt = favorite.AddedAt,
            KinopoiskRating = movie.Rating?.KinopoiskRating
        };
    }

    public async Task<bool> RemoveFromFavoritesAsync(int userId, int movieId)
    {
        var favorite = await _db.Favorites
            .FirstOrDefaultAsync(f => f.UserId == userId && f.MovieId == movieId);

        if (favorite == null) return false;

        _db.Favorites.Remove(favorite);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> IsFavoriteAsync(int userId, int movieId)
    {
        return await _db.Favorites.AnyAsync(f => f.UserId == userId && f.MovieId == movieId);
    }
}