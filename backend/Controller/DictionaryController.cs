using CinemaAPI.DTO.Dictionary;
using CinemaAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CinemaAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DictionaryController : ControllerBase
{
    private readonly IDictionaryService _dictionaryService;

    public DictionaryController(IDictionaryService dictionaryService)
    {
        _dictionaryService = dictionaryService;
    }

    private int? GetUserIdOrNull()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return claim != null ? int.Parse(claim) : null;
    }

    private int GetUserId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>
    /// Словарь видео — все слова фильма (доступно без авторизации)
    /// </summary>
    [HttpGet("movie/{movieId}")]
    public async Task<ActionResult<List<MovieWordDto>>> GetMovieWords(int movieId)
    {
        var userId = GetUserIdOrNull();
        var words = await _dictionaryService.GetMovieWordsAsync(movieId, userId);
        return Ok(words);
    }

    /// <summary>
    /// Мой словарь — все добавленные слова
    /// </summary>
    [HttpGet("my")]
    [Authorize]
    public async Task<ActionResult<List<UserWordDto>>> GetMyDictionary()
    {
        return Ok(await _dictionaryService.GetUserDictionaryAsync(GetUserId()));
    }

    /// <summary>
    /// Добавить слово в мой словарь
    /// </summary>
    [HttpPost("my/{wordId}")]
    [Authorize]
    public async Task<ActionResult<UserWordDto>> AddWord(int wordId)
    {
        try
        {
            var result = await _dictionaryService.AddWordToDictionaryAsync(GetUserId(), wordId);
            return Created($"/api/dictionary/my", result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Удалить слово из моего словаря
    /// </summary>
    [HttpDelete("my/{wordId}")]
    [Authorize]
    public async Task<IActionResult> RemoveWord(int wordId)
    {
        var removed = await _dictionaryService.RemoveWordFromDictionaryAsync(GetUserId(), wordId);
        if (!removed) return NotFound();
        return NoContent();
    }

    /// <summary>
    /// Получить слова для игры «Найди пару»
    /// </summary>
    [HttpGet("game")]
    [Authorize]
    public async Task<ActionResult<GameResponse>> GetGameWords([FromQuery] int count = 10)
    {
        var result = await _dictionaryService.GetGameWordsAsync(GetUserId(), count);

        if (result.Pairs.Count == 0)
            return BadRequest(new { message = "В вашем словаре нет слов. Добавьте слова из словаря фильма." });

        return Ok(result);
    }
}