namespace CinemaAPI.DTO.Admin.MovieWords;

public class BulkCreateMovieWordsRequest
{
    public int MovieId { get; set; }
    public List<CreateMovieWordRequest> Words { get; set; } = new();
}