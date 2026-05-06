using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CinemaAPI.Models;

[Table("user_dictionary")]
public class UserDictionary
{
    [Key]
    [Column("user_word_id")]
    public int UserWordId { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [Column("word_id")]
    public int WordId { get; set; }

    [Column("added_at")]
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("UserId")]
    public User User { get; set; } = null!;

    [ForeignKey("WordId")]
    public MovieWord MovieWord { get; set; } = null!;
}