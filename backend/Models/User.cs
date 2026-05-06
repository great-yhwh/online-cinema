using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CinemaAPI.Models;

[Table("users")]
public class User
{
    [Key]
    [Column("user_id")]
    public int UserId { get; set; }

    [Column("login")]
    [Required, MaxLength(100)]
    public string Login { get; set; } = string.Empty;

    [Column("password_hash")]
    [Required, MaxLength(255)]
    public string PasswordHash { get; set; } = string.Empty;

    [Column("role")]
    [MaxLength(20)]
    public string Role { get; set; } = "user";

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();
    public ICollection<WatchHistory> WatchHistories { get; set; } = new List<WatchHistory>();
    public ICollection<UserDictionary> UserDictionaries { get; set; } = new List<UserDictionary>();
}