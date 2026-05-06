namespace CinemaAPI.DTO.Dictionary;

public class GamePairDto
{
    public int WordId { get; set; }
    public string WordOriginal { get; set; } = string.Empty;
    public string Translation { get; set; } = string.Empty;
}

public class GameResponse
{
    public List<GamePairDto> Pairs { get; set; } = new();
    public int TotalWordsInDictionary { get; set; }
}