namespace CinemaAPI.DTO.Movies;

public class MovieDetailDto
{
    public int MovieId { get; set; }
    public string TitleOrig { get; set; } = string.Empty;
    public string? TitleRu { get; set; }
    public string? DescribeRu { get; set; }
    public string? DescribeEng { get; set; }
    public string? PosterPath { get; set; }
    public string? Country { get; set; }
    public short? Year { get; set; }
    public short? Duration { get; set; }
    public decimal? KinopoiskRating { get; set; }
    public List<string> Genres { get; set; } = new();
    public List<VideoFileDto> VideoFiles { get; set; } = new();
    public List<SubtitleDto> Subtitles { get; set; } = new();
    public List<MovieListDto> SimilarMovies { get; set; } = new();
    public int WordsCount { get; set; }
}

public class VideoFileDto
{
    public int VideoFileId { get; set; }
    public string? Quality { get; set; }
    public string VideoPath { get; set; } = string.Empty;
    public string? Format { get; set; }
}

public class SubtitleDto
{
    public int SubtitleId { get; set; }
    public string LanguageCode { get; set; } = string.Empty;
    public string SubtitlePath { get; set; } = string.Empty;
    public string? Format { get; set; }
}