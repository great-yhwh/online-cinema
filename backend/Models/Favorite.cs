using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CinemaAPI.Models;

[Table("favorites")]
public class Favorite
{
    [Key]
    [Column("favorite_id")]
    public int FavoriteId { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [Column("movie_id")]
    public int MovieId { get; set; }

    [Column("added_at")]
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("UserId")]
    public User User { get; set; } = null!;

    [ForeignKey("MovieId")]
    public Movie Movie { get; set; } = null!;
}