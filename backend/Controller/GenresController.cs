using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CinemaAPI.Data;

namespace CinemaAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GenresController : ControllerBase
{
    private readonly CinemaDbContext _db;

    public GenresController(CinemaDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetGenres()
    {
        var genres = await _db.Genres
            .Select(g => new { g.GenreId, g.Name })
            .ToListAsync();
        return Ok(genres);
    }
}