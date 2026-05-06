using System.ComponentModel.DataAnnotations;

namespace CinemaAPI.DTO.Admin.Users;

public class ChangeRoleRequest
{
    [Required]
    [RegularExpression("^(user|admin)$", ErrorMessage = "Роль должна быть 'user' или 'admin'")]
    public string Role { get; set; } = string.Empty;
}