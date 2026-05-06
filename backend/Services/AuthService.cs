using CinemaAPI.Data;
using CinemaAPI.DTO.Auth;
using CinemaAPI.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace CinemaAPI.Services;

public class AuthService : IAuthService
{
    private readonly CinemaDbContext _db;
    private readonly IConfiguration _config;

    public AuthService(CinemaDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        if (await _db.Users.AnyAsync(u => u.Login == request.Login))
            throw new InvalidOperationException("Логин уже занят");

        var user = new User
        {
            Login = request.Login,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            CreatedAt = DateTime.UtcNow
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return new AuthResponse
        {
            UserId = user.UserId,
            Login = user.Login,
            Token = GenerateJwtToken(user),
            Role = user.Role ?? "user"
        };
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Login == request.Login);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Неверный логин или пароль");

        return new AuthResponse
        {
            UserId = user.UserId,
            Login = user.Login,
            Token = GenerateJwtToken(user),
            Role = user.Role ?? "user"
        };
    }

    private string GenerateJwtToken(User user)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["JwtSettings:Secret"]!));

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new Claim(ClaimTypes.Name, user.Login),
            new Claim(ClaimTypes.Role, user.Role)
        };

        var token = new JwtSecurityToken(
            issuer: _config["JwtSettings:Issuer"],
            audience: _config["JwtSettings:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(
                double.Parse(_config["JwtSettings:ExpirationInHours"]!)),
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}