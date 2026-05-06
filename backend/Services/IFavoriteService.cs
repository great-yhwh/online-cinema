using CinemaAPI.DTO.Favorites;

namespace CinemaAPI.Services;

public interface IFavoriteService
{
    Task<List<FavoriteDto>> GetUserFavoritesAsync(int userId);
    Task<FavoriteDto> AddToFavoritesAsync(int userId, int movieId);
    Task<bool> RemoveFromFavoritesAsync(int userId, int movieId);
    Task<bool> IsFavoriteAsync(int userId, int movieId);
}