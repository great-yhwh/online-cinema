// DTO/Admin/Movies/UpdateMovieRequest.cs
using System.ComponentModel.DataAnnotations;

namespace CinemaAPI.DTO.Admin.Movies;

public class UpdateMovieRequest
{
    [MaxLength(255)]
    public string? TitleOrig { get; set; }

    [MaxLength(255)]
    public string? TitleRu { get; set; }

    public string? DescribeRu { get; set; }

    public string? DescribeEng { get; set; }

    [MaxLength(500)]
    public string? PosterPath { get; set; }

    [MaxLength(100)]
    public string? Country { get; set; }

    [Range(1888, 2100)]
    public short? Year { get; set; }

    [Range(1, 1000)]
    public short? Duration { get; set; }

    [Range(0, 10)]
    public decimal? KinopoiskRating { get; set; }

    public List<int>? GenreIds { get; set; }
}