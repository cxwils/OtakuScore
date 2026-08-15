namespace OtakuScore.api.Models
{
    public class ReadingListEntry
    {
        public int Id { get; set; }
        public int MangaId { get; set; }
        public Manga? Manga { get; set; }
        public string Status { get; set; } = "Reading";
        public string? UserId { get; set; }
    }
}