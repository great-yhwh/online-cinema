using System.ComponentModel.DataAnnotations;

namespace CinemaAPI.DTO.Admin.VideoFiles;

public class CreateVideoFileRequest
{
    [Required]
    public int MovieId { get; set; }

    [MaxLength(20)]
    public string? Quality { get; set; }

    [Required, MaxLength(500)]
    public string VideoPath { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Format { get; set; }
}