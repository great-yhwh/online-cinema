using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CinemaAPI.Models;

[Table("video_files")]
public class VideoFile
{
    [Key]
    [Column("video_file_id")]
    public int VideoFileId { get; set; }

    [Column("movie_id")]
    public int MovieId { get; set; }

    [Column("quality")]
    [Required, MaxLength(20)]
    public string Quality { get; set; } = string.Empty;

    [Column("video_path")]
    [Required, MaxLength(500)]
    public string VideoPath { get; set; } = string.Empty;

    [Column("format")]
    [Required, MaxLength(20)]
    public string Format { get; set; } = string.Empty;

    [ForeignKey("MovieId")]
    public Movie Movie { get; set; } = null!;
}