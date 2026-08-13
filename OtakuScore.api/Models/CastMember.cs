namespace OtakuScore.api.Models
{
    public class CastMember
    {
        public int Id { get; set; }
        public int AnimeId { get; set; }
        public Anime? Anime { get; set; }
        public int AniListCharacterId { get; set; }
        public string CharacterName { get; set; } = string.Empty;
        public string? CharacterImageUrl { get; set; }
        public string? CharacterDescription { get; set; }
        public string VoiceActorName { get; set; } = string.Empty;
    }
}