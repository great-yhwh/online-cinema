using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CinemaAPI.Models;

[Table("genres")]
public class Genre
{
    [Key]
    [Column("genre_id")]
    public int GenreId { get; set; }

    [Column("name")]
    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    public ICollection<MovieGenres> MovieGenres { get; set; } = new List<MovieGenres>();
}