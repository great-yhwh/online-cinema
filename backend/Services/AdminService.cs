// Services/AdminService.cs
using CinemaAPI.Data;
using CinemaAPI.DTO.Admin.Genres;
using CinemaAPI.DTO.Admin.Movies;
using CinemaAPI.DTO.Admin.MovieWords;
using CinemaAPI.DTO.Admin.Subtitles;
using CinemaAPI.DTO.Admin.Users;
using CinemaAPI.DTO.Admin.VideoFiles;
using CinemaAPI.DTO.Movies;
using CinemaAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace CinemaAPI.Services;

public class AdminService : IAdminService
{
    private readonly CinemaDbContext _db;

    public AdminService(CinemaDbContext db)
    {
        _db = db;
    }

    //  MOVIES 

    public async Task<Movie> CreateMovieAsync(CreateMovieRequest request)
    {
        var movie = new Movie
        {
            TitleOrig = request.TitleOrig,
            TitleRu = request.TitleRu,
            DescribeRu = request.DescribeRu,
            DescribeEng = request.DescribeEng,
            PosterPath = request.PosterPath,
            Country = request.Country,
            Year = request.Year,
            Duration = request.Duration,
            Created_at = DateTime.UtcNow
        };

        _db.Movies.Add(movie);
        await _db.SaveChangesAsync();

        if (request.KinopoiskRating.HasValue)
        {
            var rating = new Rating
            {
                MovieId = movie.MovieId,
                KinopoiskRating = request.KinopoiskRating.Value
            };
            _db.Ratings.Add(rating);
            await _db.SaveChangesAsync();
        }

        if (request.GenreIds?.Any() == true)
        {
            foreach (var genreId in request.GenreIds.Distinct())
            {
                _db.MovieGenres.Add(new MovieGenres
                {
                    MovieId = movie.MovieId,
                    GenreId = genreId
                });
            }
            await _db.SaveChangesAsync();
        }

        return movie;
    }

    public async Task<Movie?> UpdateMovieAsync(int id, UpdateMovieRequest request)
    {
        var movie = await _db.Movies
            .Include(m => m.MovieGenres)
            .Include(m => m.Rating)
            .FirstOrDefaultAsync(m => m.MovieId == id);

        if (movie == null)
            return null;

        if (request.TitleOrig != null) movie.TitleOrig = request.TitleOrig;
        if (request.TitleRu != null) movie.TitleRu = request.TitleRu;
        if (request.DescribeRu != null) movie.DescribeRu = request.DescribeRu;
        if (request.DescribeEng != null) movie.DescribeEng = request.DescribeEng;
        if (request.PosterPath != null) movie.PosterPath = request.PosterPath;
        if (request.Country != null) movie.Country = request.Country;
        if (request.Year.HasValue) movie.Year = request.Year.Value;
        if (request.Duration.HasValue) movie.Duration = request.Duration.Value;

        if (request.KinopoiskRating.HasValue)
        {
            if (movie.Rating != null)
            {
                movie.Rating.KinopoiskRating = request.KinopoiskRating.Value;
            }
            else
            {
                var rating = new Rating
                {
                    MovieId = movie.MovieId,
                    KinopoiskRating = request.KinopoiskRating.Value
                };
                _db.Ratings.Add(rating);
            }
        }

        if (request.GenreIds != null)
        {
            _db.MovieGenres.RemoveRange(movie.MovieGenres);

            foreach (var genreId in request.GenreIds.Distinct())
            {
                _db.MovieGenres.Add(new MovieGenres
                {
                    MovieId = movie.MovieId,
                    GenreId = genreId
                });
            }
        }

        await _db.SaveChangesAsync();
        return movie;
    }

    public async Task<bool> DeleteMovieAsync(int id)
    {
        var movie = await _db.Movies.FindAsync(id);
        if (movie == null)
            return false;

        _db.Movies.Remove(movie);
        await _db.SaveChangesAsync();
        return true;
    }

    //  GENRES 

    public async Task<Genre> CreateGenreAsync(CreateGenreRequest request)
    {
        var genre = new Genre { Name = request.Name };
        _db.Genres.Add(genre);
        await _db.SaveChangesAsync();
        return genre;
    }

    public async Task<Genre?> UpdateGenreAsync(int id, UpdateGenreRequest request)
    {
        var genre = await _db.Genres.FindAsync(id);
        if (genre == null)
            return null;

        genre.Name = request.Name;
        await _db.SaveChangesAsync();
        return genre;
    }

    public async Task<bool> DeleteGenreAsync(int id)
    {
        var genre = await _db.Genres.FindAsync(id);
        if (genre == null)
            return false;

        _db.Genres.Remove(genre);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> IsGenreInUseAsync(int id)
    {
        return await _db.MovieGenres.AnyAsync(mg => mg.GenreId == id);
    }

    //  SUBTITLES 

    public async Task<Subtitle> CreateSubtitleAsync(CreateSubtitleRequest request)
    {
        var subtitle = new Subtitle
        {
            MovieId = request.MovieId,
            LanguageCode = request.LanguageCode,
            SubtitlePath = request.SubtitlePath,
            Format = request.Format
        };

        _db.Subtitles.Add(subtitle);
        await _db.SaveChangesAsync();
        return subtitle;
    }

    public async Task<Subtitle?> UpdateSubtitleAsync(int id, UpdateSubtitleRequest request)
    {
        var subtitle = await _db.Subtitles.FindAsync(id);
        if (subtitle == null)
            return null;

        if (request.LanguageCode != null) subtitle.LanguageCode = request.LanguageCode;
        if (request.SubtitlePath != null) subtitle.SubtitlePath = request.SubtitlePath;
        if (request.Format != null) subtitle.Format = request.Format;

        await _db.SaveChangesAsync();
        return subtitle;
    }

    public async Task<bool> DeleteSubtitleAsync(int id)
    {
        var subtitle = await _db.Subtitles.FindAsync(id);
        if (subtitle == null)
            return false;

        _db.Subtitles.Remove(subtitle);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<List<SubtitleDto>> GetSubtitlesByMovieAsync(int movieId)
    {
        return await _db.Subtitles
            .Where(s => s.MovieId == movieId)
            .Select(s => new SubtitleDto
            {
                SubtitleId = s.SubtitleId,
                LanguageCode = s.LanguageCode,
                SubtitlePath = s.SubtitlePath,
                Format = s.Format
            })
            .ToListAsync();
    }

    //  VIDEO FILES 

    public async Task<VideoFile> CreateVideoFileAsync(CreateVideoFileRequest request)
    {
        var videoFile = new VideoFile
        {
            MovieId = request.MovieId,
            Quality = request.Quality,
            VideoPath = request.VideoPath,
            Format = request.Format
        };

        _db.VideoFiles.Add(videoFile);
        await _db.SaveChangesAsync();
        return videoFile;
    }

    public async Task<VideoFile?> UpdateVideoFileAsync(int id, UpdateVideoFileRequest request)
    {
        var videoFile = await _db.VideoFiles.FindAsync(id);
        if (videoFile == null)
            return null;

        if (request.Quality != null) videoFile.Quality = request.Quality;
        if (request.VideoPath != null) videoFile.VideoPath = request.VideoPath;
        if (request.Format != null) videoFile.Format = request.Format;

        await _db.SaveChangesAsync();
        return videoFile;
    }

    public async Task<bool> DeleteVideoFileAsync(int id)
    {
        var videoFile = await _db.VideoFiles.FindAsync(id);
        if (videoFile == null)
            return false;

        _db.VideoFiles.Remove(videoFile);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<List<VideoFileDto>> GetVideoFilesByMovieAsync(int movieId)
    {
        return await _db.VideoFiles
            .Where(v => v.MovieId == movieId)
            .Select(v => new VideoFileDto
            {
                VideoFileId = v.VideoFileId,
                Quality = v.Quality,
                VideoPath = v.VideoPath,
                Format = v.Format
            })
            .ToListAsync();
    }

    //    MOVIE WORDS 

    public async Task<MovieWord> CreateMovieWordAsync(CreateMovieWordRequest request)
    {
        var word = new MovieWord
        {
            MovieId = request.MovieId,
            WordOriginal = request.WordOriginal,
            Translation = request.Translation,
            Context = request.Context,
            SubtitleTime = request.SubtitleTime
        };

        _db.MovieWords.Add(word);
        await _db.SaveChangesAsync();
        return word;
    }

    public async Task<List<MovieWord>> BulkCreateMovieWordsAsync(int movieId, List<CreateMovieWordRequest> words)
    {
        var movieWords = words.Select(w => new MovieWord
        {
            MovieId = movieId,
            WordOriginal = w.WordOriginal,
            Translation = w.Translation,
            Context = w.Context,
            SubtitleTime = w.SubtitleTime
        }).ToList();

        _db.MovieWords.AddRange(movieWords);
        await _db.SaveChangesAsync();
        return movieWords;
    }

    public async Task<MovieWord?> UpdateMovieWordAsync(int id, UpdateMovieWordRequest request)
    {
        var word = await _db.MovieWords.FindAsync(id);
        if (word == null)
            return null;

        if (request.WordOriginal != null) word.WordOriginal = request.WordOriginal;
        if (request.Translation != null) word.Translation = request.Translation;
        if (request.Context != null) word.Context = request.Context;
        if (request.SubtitleTime.HasValue) word.SubtitleTime = request.SubtitleTime;

        await _db.SaveChangesAsync();
        return word;
    }

    public async Task<bool> DeleteMovieWordAsync(int id)
    {
        var word = await _db.MovieWords.FindAsync(id);
        if (word == null)
            return false;

        _db.MovieWords.Remove(word);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAllMovieWordsAsync(int movieId)
    {
        var words = await _db.MovieWords
            .Where(w => w.MovieId == movieId)
            .ToListAsync();

        if (!words.Any())
            return false;

        _db.MovieWords.RemoveRange(words);
        await _db.SaveChangesAsync();
        return true;
    }

    //  USERS 

    public async Task<List<UserListDto>> GetAllUsersAsync()
    {
        return await _db.Users
            .Select(u => new UserListDto
            {
                UserId = u.UserId,
                Login = u.Login,
                Role = u.Role,
                CreatedAt = u.CreatedAt,
                FavoritesCount = u.Favorites.Count,
                DictionaryWordsCount = u.UserDictionaries.Count
            })
            .ToListAsync();
    }

    public async Task<bool> ChangeUserRoleAsync(int userId, string newRole)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null)
            return false;

        user.Role = newRole;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteUserAsync(int userId)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null)
            return false;

        _db.Users.Remove(user);
        await _db.SaveChangesAsync();
        return true;
    }

} 