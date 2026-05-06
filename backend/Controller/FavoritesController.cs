using CinemaAPI.DTO.Favorites;
using CinemaAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CinemaAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FavoritesController : ControllerBase
{
    private readonly IFavoriteService _favoriteService;

    public FavoritesController(IFavoriteService favoriteService)
    {
        _favoriteService = favoriteService;
    }

    private int GetUserId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<List<FavoriteDto>>> GetFavorites()
    {
        return Ok(await _favoriteService.GetUserFavoritesAsync(GetUserId()));
    }

    [HttpPost("{movieId}")]
    public async Task<ActionResult<FavoriteDto>> AddFavorite(int movieId)
    {
        try
        {
            var result = await _favoriteService.AddToFavoritesAsync(GetUserId(), movieId);
            return Created($"/api/favorites/{result.FavoriteId}", result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{movieId}")]
    public async Task<IActionResult> RemoveFavorite(int movieId)
    {
        var removed = await _favoriteService.RemoveFromFavoritesAsync(GetUserId(), movieId);
        if (!removed) return NotFound();
        return NoContent();
    }

    [HttpGet("{movieId}/check")]
    public async Task<ActionResult<bool>> CheckFavorite(int movieId)
    {
        return Ok(await _favoriteService.IsFavoriteAsync(GetUserId(), movieId));
    }
}