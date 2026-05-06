// Services/IAdminService.cs
using CinemaAPI.DTO.Admin.Genres;
using CinemaAPI.DTO.Admin.Movies;
using CinemaAPI.DTO.Admin.MovieWords;
using CinemaAPI.DTO.Admin.Subtitles;
using CinemaAPI.DTO.Admin.Users;
using CinemaAPI.DTO.Admin.VideoFiles;
using CinemaAPI.DTO.Movies;
using CinemaAPI.Models;

namespace CinemaAPI.Services;

public interface IAdminService
{
    // Movies
    Task<Movie> CreateMovieAsync(CreateMovieRequest request);
    Task<Movie?> UpdateMovieAsync(int id, UpdateMovieRequest request);
    Task<bool> DeleteMovieAsync(int id);

    // Genres
    Task<Genre> CreateGenreAsync(CreateGenreRequest request);
    Task<Genre?> UpdateGenreAsync(int id, UpdateGenreRequest request);
    Task<bool> DeleteGenreAsync(int id);
    Task<bool> IsGenreInUseAsync(int id);

    // Subtitles
    Task<Subtitle> CreateSubtitleAsync(CreateSubtitleRequest request);
    Task<Subtitle?> UpdateSubtitleAsync(int id, UpdateSubtitleRequest request);
    Task<bool> DeleteSubtitleAsync(int id);
    Task<List<SubtitleDto>> GetSubtitlesByMovieAsync(int movieId);

    // VideoFiles
    Task<VideoFile> CreateVideoFileAsync(CreateVideoFileRequest request);
    Task<VideoFile?> UpdateVideoFileAsync(int id, UpdateVideoFileRequest request);
    Task<bool> DeleteVideoFileAsync(int id);
    Task<List<VideoFileDto>> GetVideoFilesByMovieAsync(int movieId);

    // MovieWords
    Task<MovieWord> CreateMovieWordAsync(CreateMovieWordRequest request);
    Task<List<MovieWord>> BulkCreateMovieWordsAsync(int movieId, List<CreateMovieWordRequest> words);
    Task<MovieWord?> UpdateMovieWordAsync(int id, UpdateMovieWordRequest request);
    Task<bool> DeleteMovieWordAsync(int id);
    Task<bool> DeleteAllMovieWordsAsync(int movieId);

    // Users
    Task<List<UserListDto>> GetAllUsersAsync();
    Task<bool> ChangeUserRoleAsync(int userId, string newRole);
    Task<bool> DeleteUserAsync(int userId);
}