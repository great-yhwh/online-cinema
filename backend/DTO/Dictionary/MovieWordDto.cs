namespace CinemaAPI.DTO.Dictionary;

public class MovieWordDto
{
    public int WordId { get; set; }
    public int MovieId { get; set; }
    public string WordOriginal { get; set; } = string.Empty;
    public string Translation { get; set; } = string.Empty;
    public string? Context { get; set; }
    public int? SubtitleTime { get; set; }
    public bool IsInUserDictionary { get; set; }
}