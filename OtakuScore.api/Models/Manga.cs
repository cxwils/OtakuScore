namespace OtakuScore.api.Models
{
    public class Manga
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Genre { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public int? AniListScore { get; set; }
        public int? Popularity { get; set; }
        public int? Chapters { get; set; }
        public int? Volumes { get; set; }
        public string? Status { get; set; }
        public string? Format { get; set; }
        public int? StartYear { get; set; }
        public List<MangaRating> Ratings { get; set; } = new();
        public List<MangaCastMember> MangaCastMembers { get; set; } = new();
    }
}