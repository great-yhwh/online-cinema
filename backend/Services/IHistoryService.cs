using CinemaAPI.DTO.History;

namespace CinemaAPI.Services;

public interface IHistoryService
{
    Task<List<WatchHistoryDto>> GetUserHistoryAsync(int userId);
    Task<WatchHistoryDto> UpdateProgressAsync(int userId, UpdateProgressRequest request);
    Task<bool> ClearHistoryAsync(int userId);
}