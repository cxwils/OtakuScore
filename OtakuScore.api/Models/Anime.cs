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
        public int? Episodes { get; set; }
        public string? Status { get; set; }
        public string? Format { get; set; }
        public string? Studio { get; set; }
        public int? SeasonYear { get; set; }
        public string? Season { get; set; }
        public int? Duration { get; set; }
        public List<Rating> Ratings { get; set; } = new();
        public List<CastMember> CastMembers { get; set; } = new();
    }
}