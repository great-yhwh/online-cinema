using System.ComponentModel.DataAnnotations;

namespace CinemaAPI.DTO.Admin.MovieWords;

public class CreateMovieWordRequest
{
    [Required]
    public int MovieId { get; set; }

    [Required, MaxLength(100)]
    public string WordOriginal { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Translation { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Context { get; set; }

    public int? SubtitleTime { get; set; }
}