using System.ComponentModel.DataAnnotations;

namespace CinemaAPI.DTO.Admin.Genres;

public class CreateGenreRequest
{
    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;
}