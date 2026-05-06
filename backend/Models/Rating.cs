using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CinemaAPI.Models;

[Table("ratings")]
public class Rating
{
    [Key]
    [Column("rating_id")]
    public int RatingId { get; set; }

    [Column("movie_id")]
    public int MovieId { get; set; }

    [Column("kinopoisk_rating")]
    [MaxLength(10)]
    public decimal? KinopoiskRating { get; set; }

    [ForeignKey("MovieId")]
    public Movie Movie { get; set; } = null!;
}