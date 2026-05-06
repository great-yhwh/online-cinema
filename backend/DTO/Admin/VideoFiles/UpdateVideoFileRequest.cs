using System.ComponentModel.DataAnnotations;

namespace CinemaAPI.DTO.Admin.VideoFiles;

public class UpdateVideoFileRequest
{
    [MaxLength(20)]
    public string? Quality { get; set; }

    [MaxLength(500)]
    public string? VideoPath { get; set; }

    [MaxLength(20)]
    public string? Format { get; set; }
}