using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CinemaAPI.Models;

[Table("movie_words")]
public class MovieWord
{
    [Key]
    [Column("word_id")]
    public int WordId { get; set; }

    [Column("movie_id")]
    public int MovieId { get; set; }

    [Column("word_original")]
    [Required, MaxLength(255)]
    public string WordOriginal { get; set; } = string.Empty;

    [Column("translation")]
    [Required, MaxLength(255)]
    public string Translation { get; set; } = string.Empty;

    [Column("context")]
    public string? Context { get; set; }

    [Column("subtitle_time")]
    public int? SubtitleTime { get; set; }

    [ForeignKey("MovieId")]
    public Movie Movie { get; set; } = null!;

    public ICollection<UserDictionary> UserDictionaries { get; set; } = new List<UserDictionary>();
}