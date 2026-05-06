using CinemaAPI.Data;
using CinemaAPI.DTO.Dictionary;
using CinemaAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace CinemaAPI.Services;

public class DictionaryService : IDictionaryService
{
    private readonly CinemaDbContext _db;

    public DictionaryService(CinemaDbContext db)
    {
        _db = db;
    }

    // Получить все слова фильма (словарь видео)
    public async Task<List<MovieWordDto>> GetMovieWordsAsync(int movieId, int? userId = null)
    {
        var userWordIds = new HashSet<int>();

        if (userId.HasValue)
        {
            userWordIds = (await _db.UserDictionaries
                .Where(ud => ud.UserId == userId.Value)
                .Select(ud => ud.WordId)
                .ToListAsync())
                .ToHashSet();
        }

        return await _db.MovieWords
            .Where(mw => mw.MovieId == movieId)
            .OrderBy(mw => mw.SubtitleTime)
            .Select(mw => new MovieWordDto
            {
                WordId = mw.WordId,
                MovieId = mw.MovieId,
                WordOriginal = mw.WordOriginal,
                Translation = mw.Translation,
                Context = mw.Context,
                SubtitleTime = mw.SubtitleTime,
                IsInUserDictionary = userWordIds.Contains(mw.WordId)
            })
            .ToListAsync();
    }

    // Получить мой словарь
    public async Task<List<UserWordDto>> GetUserDictionaryAsync(int userId)
    {
        return await _db.UserDictionaries
            .Where(ud => ud.UserId == userId)
            .Include(ud => ud.MovieWord)
                .ThenInclude(mw => mw.Movie)
            .OrderByDescending(ud => ud.AddedAt)
            .Select(ud => new UserWordDto
            {
                UserWordId = ud.UserWordId,
                WordId = ud.WordId,
                WordOriginal = ud.MovieWord.WordOriginal,
                Translation = ud.MovieWord.Translation,
                Context = ud.MovieWord.Context,
                MovieId = ud.MovieWord.MovieId,
                MovieTitle = ud.MovieWord.Movie.TitleOrig,
                AddedAt = ud.AddedAt
            })
            .ToListAsync();
    }

    // Добавить слово в мой словарь
    public async Task<UserWordDto> AddWordToDictionaryAsync(int userId, int wordId)
    {
        var word = await _db.MovieWords
            .Include(mw => mw.Movie)
            .FirstOrDefaultAsync(mw => mw.WordId == wordId)
            ?? throw new InvalidOperationException("Слово не найдено");

        if (await _db.UserDictionaries.AnyAsync(ud => ud.UserId == userId && ud.WordId == wordId))
            throw new InvalidOperationException("Слово уже в вашем словаре");

        var entry = new UserDictionary
        {
            UserId = userId,
            WordId = wordId,
            AddedAt = DateTime.UtcNow
        };

        _db.UserDictionaries.Add(entry);
        await _db.SaveChangesAsync();

        return new UserWordDto
        {
            UserWordId = entry.UserWordId,
            WordId = word.WordId,
            WordOriginal = word.WordOriginal,
            Translation = word.Translation,
            Context = word.Context,
            MovieId = word.MovieId,
            MovieTitle = word.Movie.TitleOrig,
            AddedAt = entry.AddedAt
        };
    }

    // Удалить слово из моего словаря
    public async Task<bool> RemoveWordFromDictionaryAsync(int userId, int wordId)
    {
        var entry = await _db.UserDictionaries
            .FirstOrDefaultAsync(ud => ud.UserId == userId && ud.WordId == wordId);

        if (entry == null) return false;

        _db.UserDictionaries.Remove(entry);
        await _db.SaveChangesAsync();
        return true;
    }

    // Получить слова для игры «Найди пару»
    public async Task<GameResponse> GetGameWordsAsync(int userId, int count = 10)
    {
        var totalWords = await _db.UserDictionaries
            .CountAsync(ud => ud.UserId == userId);

        var words = await _db.UserDictionaries
            .Where(ud => ud.UserId == userId)
            .Include(ud => ud.MovieWord)
            .Select(ud => new GamePairDto
            {
                WordId = ud.WordId,
                WordOriginal = ud.MovieWord.WordOriginal,
                Translation = ud.MovieWord.Translation
            })
            .ToListAsync();

        // Перемешиваем и берём нужное количество
        var random = new Random();
        var selected = words
            .OrderBy(_ => random.Next())
            .Take(count)
            .ToList();

        return new GameResponse
        {
            Pairs = selected,
            TotalWordsInDictionary = totalWords
        };
    }
}