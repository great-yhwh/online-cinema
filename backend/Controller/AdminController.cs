using CinemaAPI.DTO.Admin.Genres;
using CinemaAPI.DTO.Admin.Movies;
using CinemaAPI.DTO.Admin.MovieWords;
using CinemaAPI.DTO.Admin.Subtitles;
using CinemaAPI.DTO.Admin.Users;
using CinemaAPI.DTO.Admin.VideoFiles;
using CinemaAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Amazon.S3;
using Amazon.S3.Model;

namespace CinemaAPI.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;
    private readonly IAmazonS3 _s3Client;
    private const string BucketName = "cinema-static";
    private const string BaseUrl = "https://cinema-static.website.yandexcloud.net";

    public AdminController(IAdminService adminService, IAmazonS3 s3Client)
    {
        _adminService = adminService;
        _s3Client = s3Client;
    }

    //  UPLOAD

    [HttpPost("upload/poster")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> UploadPoster(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { error = "Файл не выбран" });

        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(ext))
            return BadRequest(new { error = "Недопустимый формат. Разрешены: .jpg, .jpeg, .png, .webp" });

        var uniqueFileName = $"{Guid.NewGuid()}{ext}";
        var key = $"posters/{uniqueFileName}";

        using var stream = file.OpenReadStream();
        var putRequest = new PutObjectRequest
        {
            BucketName = BucketName,
            Key = key,
            InputStream = stream,
            ContentType = file.ContentType
        };

        await _s3Client.PutObjectAsync(putRequest);

        var publicUrl = $"{BaseUrl}/{key}";
        return Ok(new { path = publicUrl });
    }

    [HttpPost("upload/video")]
    [Authorize(Roles = "admin")]
    [DisableRequestSizeLimit]
    [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue, ValueLengthLimit = int.MaxValue)]
    public async Task<IActionResult> UploadVideo(IFormFile file)
    {
        try
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { error = "Файл не выбран" });

            var allowedExtensions = new[] { ".mp4", ".mkv", ".avi", ".mov", ".webm" };
            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(ext))
                return BadRequest(new { error = $"Недопустимый формат. Разрешены: {string.Join(", ", allowedExtensions)}" });

            var safeName = GetSafeFileName(file.FileName);
            var finalFileName = $"{safeName}{ext}";
            var key = $"movies/{finalFileName}";

            // существует ли уже такой ключ в бакете
            int counter = 1;
            while (await S3ObjectExistsAsync(key))
            {
                finalFileName = $"{safeName}_{counter}{ext}";
                key = $"movies/{finalFileName}";
                counter++;
            }

            using var stream = file.OpenReadStream();
            var putRequest = new PutObjectRequest
            {
                BucketName = BucketName,
                Key = key,
                InputStream = stream,
                ContentType = file.ContentType
            };

            await _s3Client.PutObjectAsync(putRequest);

            var publicUrl = $"{BaseUrl}/{key}";
            return Ok(new { path = publicUrl, fileName = finalFileName });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"ERROR uploading video: {ex.Message}");
            return StatusCode(500, new { error = "Ошибка сервера при загрузке файла", detail = ex.Message });
        }
    }

    [HttpPost("upload/subtitle")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> UploadSubtitle(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { error = "Файл не выбран" });

        var allowedExtensions = new[] { ".vtt", ".srt" };
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(ext))
            return BadRequest(new { error = "Недопустимый формат субтитров. Разрешены: .vtt, .srt" });

        var uniqueFileName = $"{Guid.NewGuid()}{ext}";
        var key = $"subtitles/{uniqueFileName}";

        using var stream = file.OpenReadStream();
        var putRequest = new PutObjectRequest
        {
            BucketName = BucketName,
            Key = key,
            InputStream = stream,
            ContentType = file.ContentType
        };

        await _s3Client.PutObjectAsync(putRequest);

        var publicUrl = $"{BaseUrl}/{key}";
        return Ok(new { path = publicUrl });
    }

    //  MOVIE

    [HttpPost("movies")]
    public async Task<IActionResult> CreateMovie([FromBody] CreateMovieRequest request)
    {
        try
        {
            var movie = await _adminService.CreateMovieAsync(request);
            var response = new MovieCreatedResponse
            {
                MovieId = movie.MovieId,
                TitleOrig = movie.TitleOrig ?? "",
                TitleRu = movie.TitleRu,
                Year = movie.Year,
                Message = "Фильм успешно создан"
            };
            return Created($"/api/movies/{movie.MovieId}", response);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"ERROR: {ex}");
            return StatusCode(500, new { error = ex.Message, detail = ex.InnerException?.Message });
        }
    }

    [HttpGet("movies/{id}")]
    public async Task<IActionResult> GetMovie(int id)
    {
        return Ok(new { message = "Use GET /api/movies/{id} for details" });
    }

    [HttpPut("movies/{id}")]
    public async Task<IActionResult> UpdateMovie(int id, [FromBody] UpdateMovieRequest request)
    {
        var movie = await _adminService.UpdateMovieAsync(id, request);
        if (movie == null)
            return NotFound(new { error = "Фильм не найден" });

        return Ok(new MovieUpdatedResponse
        {
            MovieId = movie.MovieId,
            TitleOrig = movie.TitleOrig ?? "",
            TitleRu = movie.TitleRu,
            Year = movie.Year,
            Message = "Фильм успешно обновлён"
        });
    }

    [HttpDelete("movies/{id}")]
    public async Task<IActionResult> DeleteMovie(int id)
    {
        var deleted = await _adminService.DeleteMovieAsync(id);
        if (!deleted)
            return NotFound(new { error = "Фильм не найден" });

        return NoContent();
    }

    //  GENRE

    [HttpPost("genres")]
    public async Task<IActionResult> CreateGenre([FromBody] CreateGenreRequest request)
    {
        var genre = await _adminService.CreateGenreAsync(request);
        return CreatedAtAction(nameof(GetGenres), new { id = genre.GenreId }, genre);
    }

    [HttpGet("genres")]
    public async Task<IActionResult> GetGenres()
    {
        return Ok(new { message = "Use GET /api/genres" });
    }

    [HttpPut("genres/{id}")]
    public async Task<IActionResult> UpdateGenre(int id, [FromBody] UpdateGenreRequest request)
    {
        var genre = await _adminService.UpdateGenreAsync(id, request);
        if (genre == null)
            return NotFound(new { error = "Жанр не найден" });

        return Ok(genre);
    }

    [HttpDelete("genres/{id}")]
    public async Task<IActionResult> DeleteGenre(int id)
    {
        if (await _adminService.IsGenreInUseAsync(id))
            return BadRequest(new { error = "Жанр используется в фильмах. Сначала удалите связи." });

        var deleted = await _adminService.DeleteGenreAsync(id);
        if (!deleted)
            return NotFound(new { error = "Жанр не найден" });

        return NoContent();
    }

    //  SUBTITLE

    [HttpPost("subtitles")]
    public async Task<IActionResult> CreateSubtitle([FromBody] CreateSubtitleRequest request)
    {
        var subtitle = await _adminService.CreateSubtitleAsync(request);
        return Created($"/api/admin/subtitles/{subtitle.SubtitleId}", subtitle);
    }

    [HttpGet("movies/{movieId}/subtitles")]
    public async Task<IActionResult> GetMovieSubtitles(int movieId)
    {
        var subtitles = await _adminService.GetSubtitlesByMovieAsync(movieId);
        return Ok(subtitles);
    }

    [HttpPut("subtitles/{id}")]
    public async Task<IActionResult> UpdateSubtitle(int id, [FromBody] UpdateSubtitleRequest request)
    {
        var subtitle = await _adminService.UpdateSubtitleAsync(id, request);
        if (subtitle == null)
            return NotFound(new { error = "Субтитры не найдены" });

        return Ok(subtitle);
    }

    [HttpDelete("subtitles/{id}")]
    public async Task<IActionResult> DeleteSubtitle(int id)
    {
        var deleted = await _adminService.DeleteSubtitleAsync(id);
        if (!deleted)
            return NotFound(new { error = "Субтитры не найдены" });

        return NoContent();
    }

    //  VIDEO

    [HttpPost("video-files")]
    public async Task<IActionResult> CreateVideoFile([FromBody] CreateVideoFileRequest request)
    {
        var videoFile = await _adminService.CreateVideoFileAsync(request);
        return Created($"/api/admin/video-files/{videoFile.VideoFileId}", videoFile);
    }

    [HttpGet("movies/{movieId}/video-files")]
    public async Task<IActionResult> GetMovieVideoFiles(int movieId)
    {
        var files = await _adminService.GetVideoFilesByMovieAsync(movieId);
        return Ok(files);
    }

    [HttpPut("video-files/{id}")]
    public async Task<IActionResult> UpdateVideoFile(int id, [FromBody] UpdateVideoFileRequest request)
    {
        var videoFile = await _adminService.UpdateVideoFileAsync(id, request);
        if (videoFile == null)
            return NotFound(new { error = "Видеофайл не найден" });

        return Ok(videoFile);
    }

    [HttpDelete("video-files/{id}")]
    public async Task<IActionResult> DeleteVideoFile(int id)
    {
        var deleted = await _adminService.DeleteVideoFileAsync(id);
        if (!deleted)
            return NotFound(new { error = "Видеофайл не найден" });

        return NoContent();
    }

    // WORDS 

    [HttpPost("movie-words")]
    public async Task<IActionResult> CreateMovieWord([FromBody] CreateMovieWordRequest request)
    {
        var word = await _adminService.CreateMovieWordAsync(request);
        return Created($"/api/admin/movie-words/{word.WordId}", word);
    }

    [HttpPost("movies/{movieId}/words/bulk")]
    public async Task<IActionResult> BulkCreateMovieWords(int movieId, [FromBody] List<CreateMovieWordRequest> words)
    {
        foreach (var word in words) word.MovieId = movieId;
        var created = await _adminService.BulkCreateMovieWordsAsync(movieId, words);
        return Ok(new { created = created.Count, message = $"Добавлено {created.Count} слов" });
    }

    [HttpPut("movie-words/{id}")]
    public async Task<IActionResult> UpdateMovieWord(int id, [FromBody] UpdateMovieWordRequest request)
    {
        var word = await _adminService.UpdateMovieWordAsync(id, request);
        if (word == null)
            return NotFound(new { error = "Слово не найдено" });
        return Ok(word);
    }

    [HttpDelete("movie-words/{id}")]
    public async Task<IActionResult> DeleteMovieWord(int id)
    {
        var deleted = await _adminService.DeleteMovieWordAsync(id);
        if (!deleted) return NotFound(new { error = "Слово не найдено" });
        return NoContent();
    }

    [HttpDelete("movies/{movieId}/words")]
    public async Task<IActionResult> DeleteAllMovieWords(int movieId)
    {
        var deleted = await _adminService.DeleteAllMovieWordsAsync(movieId);
        if (!deleted) return NotFound(new { error = "Слова не найдены или фильм не существует" });
        return NoContent();
    }

    //  USER

    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _adminService.GetAllUsersAsync();
        return Ok(users);
    }

    [HttpPatch("users/{id}/role")]
    public async Task<IActionResult> ChangeUserRole(int id, [FromBody] ChangeRoleRequest request)
    {
        var changed = await _adminService.ChangeUserRoleAsync(id, request.Role);
        if (!changed) return NotFound(new { error = "Пользователь не найден" });
        return Ok(new { message = $"Роль изменена на '{request.Role}'" });
    }

    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var deleted = await _adminService.DeleteUserAsync(id);
        if (!deleted) return NotFound(new { error = "Пользователь не найден" });
        return NoContent();
    }


    private async Task<bool> S3ObjectExistsAsync(string key)
    {
        try
        {
            await _s3Client.GetObjectMetadataAsync(BucketName, key);
            return true;
        }
        catch (Amazon.S3.AmazonS3Exception ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return false;
        }
    }

    private string GetSafeFileName(string originalName)
    {
        var name = Path.GetFileNameWithoutExtension(originalName);
        var safeName = string.Join("_", name.Split(Path.GetInvalidFileNameChars()));
        return string.IsNullOrWhiteSpace(safeName) ? "video" : safeName;
    }
}