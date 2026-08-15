namespace OtakuScore.api.Models
{
    public class MangaRating
    {
        public int Id { get; set; }
        public int MangaId { get; set; }
        public Manga? Manga { get; set; }

        public int Premise { get; set; }
        public int Plot { get; set; }
        public int Characters { get; set; }
        public int ArtStyle { get; set; }
        public int Pacing { get; set; }
        public int Ending { get; set; }
        public int BingeAbility { get; set; }

        public string? Review { get; set; }
        public string? UserId { get; set; }

        public double OverallScore =>
            Math.Round((Premise + Plot + Characters + ArtStyle + Pacing + Ending + BingeAbility) / 7.0, 2);
    }
}