using CinemaAPI.DTO.Dictionary;

namespace CinemaAPI.Services;

public interface IDictionaryService
{
    // Словарь видео (слова фильма)
    Task<List<MovieWordDto>> GetMovieWordsAsync(int movieId, int? userId = null);

    // Мой словарь
    Task<List<UserWordDto>> GetUserDictionaryAsync(int userId);
    Task<UserWordDto> AddWordToDictionaryAsync(int userId, int wordId);
    Task<bool> RemoveWordFromDictionaryAsync(int userId, int wordId);

    // Игра Найди пару
    Task<GameResponse> GetGameWordsAsync(int userId, int count = 10);
}