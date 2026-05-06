using System.ComponentModel.DataAnnotations;

namespace CinemaAPI.DTO.Admin.Subtitles;

public class UpdateSubtitleRequest
{
    [MaxLength(10)]
    public string? LanguageCode { get; set; }

    [MaxLength(500)]
    public string? SubtitlePath { get; set; }

    [MaxLength(20)]
    public string? Format { get; set; }
}