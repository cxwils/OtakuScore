namespace OtakuScore.api.Models
{
    public class WatchlistEntry
    {
        public int Id { get; set; }
        public int AnimeId { get; set; }
        public Anime? Anime { get; set; }
        public string Status { get; set; } = "Watching";
    }
}