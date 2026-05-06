namespace CinemaAPI.DTO.Movies;

public class MovieListDto
{
    public int MovieId { get; set; }
    public string TitleOrig { get; set; } = string.Empty;
    public string? TitleRu { get; set; }
    public string? PosterPath { get; set; }
    public string? Country { get; set; }
    public short? Year { get; set; }
    public short? Duration { get; set; }
    public decimal? KinopoiskRating { get; set; }
    public List<string> Genres { get; set; } = new();
    public List<string> SubtitleLanguages { get; set; } = new();
}