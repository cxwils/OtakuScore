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
    }
}