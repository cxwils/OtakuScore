using Microsoft.EntityFrameworkCore;
using OtakuScore.api.Models;

namespace OtakuScore.api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Anime> Anime { get; set; }
        public DbSet<Rating> Rating { get; set; }
        public DbSet<WatchlistEntry> WatchlistEntry { get; set; }
        public DbSet<CastMember> CastMember { get; set; }
        public DbSet<Manga> Manga { get; set; }
        public DbSet<MangaRating> MangaRating { get; set; }
        public DbSet<ReadingListEntry> ReadingListEntry { get; set; }
        public DbSet<MangaCastMember> MangaCastMember { get; set; }
    }
}