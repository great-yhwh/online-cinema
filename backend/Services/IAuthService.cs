using CinemaAPI.DTO.Auth;

namespace CinemaAPI.Services;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);

}