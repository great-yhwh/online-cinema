using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CinemaAPI.Models;

[Table("movies")]
public class Movie
{
    [Key]
    [Column("movie_id")]
    public int MovieId { get; set; }

    [Column("title_orig")]
    [Required, MaxLength(255)]
    public string? TitleOrig { get; set; } = string.Empty;

    [Column("title_ru")]
    [MaxLength(255)]
    public string? TitleRu { get; set; }

    [Column("describe_ru")]
    public string? DescribeRu { get; set; }

    [Column("describe_eng")]
    public string? DescribeEng { get; set; }

    [Column("poster_path")]
    [MaxLength(500)]
    public string? PosterPath { get; set; }

    [Column("year")]
    public short? Year { get; set; }

    [Column("country")]
    [MaxLength(100)]
    public string? Country { get; set; }

    [Column("duration")]
    public short? Duration { get; set; }

    [Column("created_at")]
    public DateTime Created_at { get; set; }

    public ICollection<VideoFile> VideoFiles { get; set; } = new List<VideoFile>();
    public ICollection<Subtitle> Subtitles { get; set; } = new List<Subtitle>();
    public ICollection<MovieGenres> MovieGenres { get; set; } = new List<MovieGenres>();
    public ICollection<MovieWord> MovieWords { get; set; } = new List<MovieWord>();
    public Rating? Rating { get; set; }
}