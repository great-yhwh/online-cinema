namespace CinemaAPI.DTO.Favorites;

public class FavoriteDto
{
    public int FavoriteId { get; set; }
    public int MovieId { get; set; }
    public string TitleOrig { get; set; } = string.Empty;
    public string? TitleRu { get; set; }
    public string? PosterPath { get; set; }
    public int? Year { get; set; }
    public decimal? KinopoiskRating { get; set; }
    public List<string> Genres { get; set; } = new();
    public DateTime AddedAt { get; set; }
}