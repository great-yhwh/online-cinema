namespace CinemaAPI.DTO.Dictionary;

public class UserWordDto
{
    public int UserWordId { get; set; }
    public int WordId { get; set; }
    public string WordOriginal { get; set; } = string.Empty;
    public string Translation { get; set; } = string.Empty;
    public string? Context { get; set; }
    public int MovieId { get; set; }
    public string MovieTitle { get; set; } = string.Empty;
    public DateTime AddedAt { get; set; }
}