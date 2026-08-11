namespace OtakuScore.api.Models
{
    public class Rating
    {
        public int Id { get; set; }
        public int AnimeId { get; set; }
        public Anime? Anime { get; set; }

        public int Premise { get; set; }
        public int Plot { get; set; }
        public int Characters { get; set; }
        public int ArtStyle { get; set; }
        public int Animation { get; set; }
        public int Pacing { get; set; }
        public int Ending { get; set; }
        public int BingeAbility { get; set; }

        public string? Review { get; set; }

        public double OverallScore =>
            Math.Round((Premise + Plot + Characters + ArtStyle + Animation + Pacing + Ending + BingeAbility) / 8.0, 2);
    }
}