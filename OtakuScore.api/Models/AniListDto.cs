using System.Text.Json.Serialization;

namespace OtakuScore.api.Models
{
	public class AniListResponse
	{
		[JsonPropertyName("data")]
		public AniListData Data { get; set; } = new();
	}

	public class AniListData
	{
		[JsonPropertyName("Page")]
		public AniListPage Page { get; set; } = new();
	}

	public class AniListPage
	{
		[JsonPropertyName("media")]
		public List<AniListMedia> Media { get; set; } = new();
	}

    public class AniListMedia
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }
        [JsonPropertyName("title")]
        public AniListTitle Title { get; set; } = new();
        [JsonPropertyName("description")]
        public string? Description { get; set; }
        [JsonPropertyName("genres")]
        public List<string> Genres { get; set; } = new();
        [JsonPropertyName("coverImage")]
        public AniListCoverImage CoverImage { get; set; } = new();
        [JsonPropertyName("averageScore")]
        public int? AverageScore { get; set; }
        [JsonPropertyName("popularity")]
        public int? Popularity { get; set; }
    }

    public class AniListCoverImage
    {
        [JsonPropertyName("large")]
        public string? Large { get; set; }
    }

    public class AniListTitle
	{
		[JsonPropertyName("romaji")]
		public string Romaji { get; set; } = string.Empty;
	}

}