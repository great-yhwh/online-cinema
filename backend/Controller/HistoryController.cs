using CinemaAPI.DTO.History;
using CinemaAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CinemaAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class HistoryController : ControllerBase
{
    private readonly IHistoryService _historyService;

    public HistoryController(IHistoryService historyService)
    {
        _historyService = historyService;
    }

    private int GetUserId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<List<WatchHistoryDto>>> GetHistory()
    {
        return Ok(await _historyService.GetUserHistoryAsync(GetUserId()));
    }

    [HttpPost("progress")]
    public async Task<ActionResult<WatchHistoryDto>> UpdateProgress(
        [FromBody] UpdateProgressRequest request)
    {
        try
        {
            var result = await _historyService.UpdateProgressAsync(GetUserId(), request);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete]
    public async Task<IActionResult> ClearHistory()
    {
        await _historyService.ClearHistoryAsync(GetUserId());
        return NoContent();
    }
}