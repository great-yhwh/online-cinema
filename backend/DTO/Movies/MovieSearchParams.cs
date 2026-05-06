namespace CinemaAPI.DTO.Movies;

public class MovieSearchParams
{
    public string? Query { get; set; }
    public int? GenreId { get; set; }
    public string? Country { get; set; }
    public int? YearFrom { get; set; }
    public int? YearTo { get; set; }
    public string? SortBy { get; set; }
    public string? SortOrder { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
}