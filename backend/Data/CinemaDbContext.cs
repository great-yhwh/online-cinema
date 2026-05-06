using Microsoft.EntityFrameworkCore;
using CinemaAPI.Models;

namespace CinemaAPI.Data;

public class CinemaDbContext : DbContext
{
    public CinemaDbContext(DbContextOptions<CinemaDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Movie> Movies => Set<Movie>();
    public DbSet<VideoFile> VideoFiles => Set<VideoFile>();
    public DbSet<Subtitle> Subtitles => Set<Subtitle>();
    public DbSet<Genre> Genres => Set<Genre>();
    public DbSet<MovieGenres> MovieGenres => Set<MovieGenres>();
    public DbSet<Favorite> Favorites => Set<Favorite>();
    public DbSet<WatchHistory> WatchHistories => Set<WatchHistory>();
    public DbSet<Rating> Ratings => Set<Rating>();
    public DbSet<MovieWord> MovieWords => Set<MovieWord>();
    public DbSet<UserDictionary> UserDictionaries => Set<UserDictionary>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Users
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Login).IsUnique();

        // MovieGenres
        modelBuilder.Entity<MovieGenres>()
            .HasIndex(mg => new { mg.MovieId, mg.GenreId }).IsUnique();

        // Favorites
        modelBuilder.Entity<Favorite>()
            .HasIndex(f => new { f.UserId, f.MovieId }).IsUnique();

        // Ratings 
        modelBuilder.Entity<Rating>()
            .HasIndex(r => r.MovieId).IsUnique();

        modelBuilder.Entity<Movie>()
            .HasOne(m => m.Rating)
            .WithOne(r => r.Movie)
            .HasForeignKey<Rating>(r => r.MovieId);

        // Subtitles 
        modelBuilder.Entity<Subtitle>()
            .HasIndex(s => new { s.MovieId, s.LanguageCode }).IsUnique();

        // MovieWords 
        modelBuilder.Entity<MovieWord>()
            .HasIndex(mw => new { mw.MovieId, mw.WordOriginal }).IsUnique();

        // UserDictionary
        modelBuilder.Entity<UserDictionary>()
            .HasIndex(ud => new { ud.UserId, ud.WordId }).IsUnique();
    }
}