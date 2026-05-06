using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CinemaAPI.Models;

[Table("movie_genres")]
public class MovieGenres
{
    [Key]
    [Column("movie_genre_id")]
    public int GenreMovieId { get; set; }

    [Column("movie_id")]
    public int MovieId { get; set; }

    [Column("genre_id")]
    public int GenreId { get; set; }

    [ForeignKey("MovieId")]
    public Movie Movie { get; set; } = null!;

    [ForeignKey("GenreId")]
    public Genre Genre { get; set; } = null!;
}