using System.ComponentModel.DataAnnotations;

namespace CinemaAPI.DTO.Admin.Subtitles;

public class CreateSubtitleRequest
{
    [Required]
    public int MovieId { get; set; }

    [Required, MaxLength(10)]
    public string LanguageCode { get; set; } = string.Empty;

    [Required, MaxLength(500)]
    public string SubtitlePath { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Format { get; set; }
}