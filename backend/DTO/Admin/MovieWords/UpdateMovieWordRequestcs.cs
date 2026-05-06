using System.ComponentModel.DataAnnotations;

namespace CinemaAPI.DTO.Admin.MovieWords;

public class UpdateMovieWordRequest
{
    [MaxLength(100)]
    public string? WordOriginal { get; set; }

    [MaxLength(100)]
    public string? Translation { get; set; }

    [MaxLength(500)]
    public string? Context { get; set; }

    public int? SubtitleTime { get; set; }
}