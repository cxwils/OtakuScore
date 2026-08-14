namespace OtakuScore.api.Models
{
    public class MangaCastMember
    {
        public int Id { get; set; }
        public int MangaId { get; set; }
        public Manga? Manga { get; set; }
        public int AniListCharacterId { get; set; }
        public string CharacterName { get; set; } = string.Empty;
        public string? CharacterImageUrl { get; set; }
        public string? CharacterDescription { get; set; }
    }
}