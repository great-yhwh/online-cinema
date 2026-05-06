using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CinemaAPI.Models;

[Table("watch_history")]
public class WatchHistory
{
    [Key]
    [Column("watch_history_id")]
    public int WatchHistoryId { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [Column("movie_id")]
    public int MovieId { get; set; }

    [Column("watched_at")]
    public DateTime WatchedAt { get; set; } = DateTime.UtcNow;

    [Column("progress_time")]
    public int ProgressTime { get; set; } = 0;

    [Column("completed")]
    public bool Completed { get; set; } = false;

    [ForeignKey("UserId")]
    public User User { get; set; } = null!;

    [ForeignKey("MovieId")]
    public Movie Movie { get; set; } = null!;
}