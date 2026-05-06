using CinemaAPI.Data;
using CinemaAPI.DTO.Auth;
using CinemaAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CinemaAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        try
        {
            var result = await _authService.RegisterAsync(request);

            SetTokenCookie(result.Token);

            return Ok(new
            {
                userId = result.UserId,
                login = result.Login,
                role = result.Role
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            var result = await _authService.LoginAsync(request);

            SetTokenCookie(result.Token);

            return Ok(new
            {
                userId = result.UserId,
                login = result.Login,
                role = result.Role
            });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        var isDevelopment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development";

        Response.Cookies.Delete("token", new CookieOptions
        {
            HttpOnly = true,
            Secure = !isDevelopment,
            SameSite = SameSiteMode.Lax,
            Path = "/"
        });

        return Ok(new { message = "Вы вышли из системы" });
    }

    [HttpGet("me")]
    [Authorize]
    public IActionResult GetCurrentUser()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var login = User.FindFirst(ClaimTypes.Name)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;

        return Ok(new
        {
            userId,
            login,
            role
        });
    }

    private void SetTokenCookie(string token)
    {
        var isDevelopment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development";

        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = !isDevelopment,
            SameSite = SameSiteMode.Lax,
            Path = "/",
            Expires = DateTimeOffset.UtcNow.AddDays(7)
        };

        Response.Cookies.Append("token", token, cookieOptions);
    }
}