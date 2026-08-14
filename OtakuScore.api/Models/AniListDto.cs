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
        [JsonPropertyName("episodes")]
        public int? Episodes { get; set; }
        [JsonPropertyName("status")]
        public string? Status { get; set; }
        [JsonPropertyName("format")]
        public string? Format { get; set; }
        [JsonPropertyName("studios")]
        public AniListStudioConnection Studios { get; set; } = new();
        [JsonPropertyName("seasonYear")]
        public int? SeasonYear { get; set; }
        [JsonPropertyName("season")]
        public string? Season { get; set; }
        [JsonPropertyName("duration")]
        public int? Duration { get; set; }
        [JsonPropertyName("characters")]
        public AniListCharacterConnection Characters { get; set; } = new();
        [JsonPropertyName("chapters")]
        public int? Chapters { get; set; }
        [JsonPropertyName("volumes")]
        public int? Volumes { get; set; }
        [JsonPropertyName("startDate")]
        public AniListStartDate? StartDate { get; set; }
    }

    public class AniListStudioConnection
    {
        [JsonPropertyName("nodes")]
        public List<AniListStudio> Nodes { get; set; } = new();
    }

    public class AniListStudio
    {
        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;
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

    public class AniListCharacterConnection
    {
        [JsonPropertyName("edges")]
        public List<AniListCharacterEdge> Edges { get; set; } = new();
    }

    public class AniListCharacterEdge
    {
        [JsonPropertyName("node")]
        public AniListCharacter Node { get; set; } = new();
        [JsonPropertyName("voiceActors")]
        public List<AniListVoiceActor> VoiceActors { get; set; } = new();
    }

    public class AniListCharacter
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }
        [JsonPropertyName("name")]
        public AniListCharacterName Name { get; set; } = new();
        [JsonPropertyName("image")]
        public AniListCoverImage Image { get; set; } = new();
        [JsonPropertyName("description")]
        public string? Description { get; set; }
    }

    public class AniListCharacterName
    {
        [JsonPropertyName("full")]
        public string Full { get; set; } = string.Empty;
    }

    public class AniListVoiceActor
    {
        [JsonPropertyName("name")]
        public AniListCharacterName Name { get; set; } = new();
    }

    public class AniListStartDate
    {
        [JsonPropertyName("year")]
        public int? Year { get; set; }
    }


}