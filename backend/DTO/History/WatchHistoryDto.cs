namespace CinemaAPI.DTO.History;

public class WatchHistoryDto
{
    public int WatchHistoryId { get; set; }
    public int MovieId { get; set; }
    public string TitleOrig { get; set; } = string.Empty;
    public string? TitleRu { get; set; }
    public int? Year { get; set; }
    public List<string> Genres { get; set; } = new();
    public string? PosterPath { get; set; }
    public DateTime WatchedAt { get; set; }
    public int ProgressTime { get; set; }
    public bool Completed { get; set; }
}

public class UpdateProgressRequest
{
    public int MovieId { get; set; }
    public int ProgressTime { get; set; }
    public bool Completed { get; set; }
}