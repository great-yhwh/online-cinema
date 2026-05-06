namespace CinemaAPI.DTO.Admin.Movies
{
    public class MovieUpdatedResponse
    {
        public int MovieId { get; set; }
        public string TitleOrig { get; set; } = string.Empty;
        public string? TitleRu { get; set; }
        public short? Year { get; set; }
        public List<string> Genres { get; set; } = new();
        public string Message { get; set; } = "Фильм обновлен";
    }
}
