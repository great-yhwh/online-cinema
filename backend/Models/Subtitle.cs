using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CinemaAPI.Models;

[Table("subtitles")]
public class Subtitle
{
    [Key]
    [Column("subtitle_id")]
    public int SubtitleId { get; set; }

    [Column("movie_id")]
    public int MovieId { get; set; }

    [Column("language_code")]
    [Required, MaxLength(10)]
    public string LanguageCode { get; set; } = string.Empty;

    [Column("subtitle_path")]
    [Required, MaxLength(500)]
    public string SubtitlePath { get; set; } = string.Empty;

    [Column("format")]
    [Required, MaxLength(20)]
    public string Format { get; set; } = string.Empty;

    [ForeignKey("MovieId")]
    public Movie Movie { get; set; } = null!;
}