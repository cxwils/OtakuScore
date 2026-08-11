namespace OtakuScore.api.Models
{
    public class Anime
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Genre { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public int? AniListScore { get; set; }
        public int? Popularity { get; set; }
        public List<Rating> Ratings { get; set; } = new();
    }
}