using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using OtakuScore.api.Models;

namespace OtakuScore.api.Data
{
    public class AppDbContext : IdentityDbContext<IdentityUser>
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
        public DbSet<EmailOtp> EmailOtp { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            builder.Entity<CastMember>().HasIndex(c => new { c.AniListCharacterId, c.Id });
        }
    }
}