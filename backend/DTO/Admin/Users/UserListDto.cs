namespace CinemaAPI.DTO.Admin.Users;

public class UserListDto
{
    public int UserId { get; set; }
    public string Login { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public int FavoritesCount { get; set; }
    public int DictionaryWordsCount { get; set; }
}