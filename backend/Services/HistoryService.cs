using CinemaAPI.Data;
using CinemaAPI.DTO.History;
using CinemaAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace CinemaAPI.Services;

public class HistoryService : IHistoryService
{
    private readonly CinemaDbContext _db;

    public HistoryService(CinemaDbContext db)
    {
        _db = db;
    }

    public async Task<List<WatchHistoryDto>> GetUserHistoryAsync(int userId)
    {
        return await _db.WatchHistories
            .Where(h => h.UserId == userId)
            .Include(h => h.Movie)
                .ThenInclude(m => m.MovieGenres)
                    .ThenInclude(mg => mg.Genre)  
            .OrderByDescending(h => h.WatchedAt)
            .Select(h => new WatchHistoryDto
            {
                WatchHistoryId = h.WatchHistoryId,
                MovieId = h.MovieId,
                TitleOrig = h.Movie.TitleOrig,
                TitleRu = h.Movie.TitleRu,
                PosterPath = h.Movie.PosterPath,
                Year = h.Movie.Year,  
                Genres = h.Movie.MovieGenres
                    .Select(mg => mg.Genre.Name )
                    .ToList(), 
                WatchedAt = h.WatchedAt,
                ProgressTime = h.ProgressTime,
                Completed = h.Completed
            })
            .ToListAsync();
    }

    public async Task<WatchHistoryDto> UpdateProgressAsync(int userId, UpdateProgressRequest request)
    {
        var movie = await _db.Movies.FindAsync(request.MovieId)
            ?? throw new InvalidOperationException("Фильм не найден");

        var history = await _db.WatchHistories
            .FirstOrDefaultAsync(h => h.UserId == userId && h.MovieId == request.MovieId);

        if (history == null)
        {
            history = new WatchHistory
            {
                UserId = userId,
                MovieId = request.MovieId
            };
            _db.WatchHistories.Add(history);
        }

        history.ProgressTime = request.ProgressTime;
        history.Completed = request.Completed;
        history.WatchedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return new WatchHistoryDto
        {
            WatchHistoryId = history.WatchHistoryId,
            MovieId = history.MovieId,
            TitleOrig = history.Movie.TitleOrig,
            TitleRu = history.Movie.TitleRu,
            PosterPath = history.Movie.PosterPath,
            Year = history.Movie.Year,
            Genres = history.Movie.MovieGenres
                .Select(mg => mg.Genre.Name)
                .ToList(),
            WatchedAt = history.WatchedAt,
            ProgressTime = history.ProgressTime,
            Completed = history.Completed
        };
    }

    public async Task<bool> ClearHistoryAsync(int userId)
    {
        var items = await _db.WatchHistories
            .Where(h => h.UserId == userId)
            .ToListAsync();

        if (!items.Any()) return false;

        _db.WatchHistories.RemoveRange(items);
        await _db.SaveChangesAsync();
        return true;
    }
}