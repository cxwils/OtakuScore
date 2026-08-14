using Microsoft.EntityFrameworkCore;
using OtakuScore.api.Data;
using OtakuScore.api.Models;
using System.Text.Json;

static string StripHtml(string input)
{
    return System.Text.RegularExpressions.Regex.Replace(input, "<.*?>", " ").Trim();
}

static string CleanCharacterDescription(string input)
{
    var noBold = System.Text.RegularExpressions.Regex.Replace(input, "__(.*?)__", "$1");
    var noLinks = System.Text.RegularExpressions.Regex.Replace(noBold, @"\[([^\]]+)\]\([^\)]+\)", "$1");
    return noLinks.Trim();
}

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
});
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddHttpClient("AniList", client =>
{
    client.BaseAddress = new Uri("https://graphql.anilist.co/");
    client.Timeout = TimeSpan.FromSeconds(30);
});
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();
app.UseCors("AllowReactApp");
// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.MapGet("/api/anime", async (AppDbContext db, int page = 1, int pageSize = 25, string? search = null, string? genre = null, string? sort = null) =>
{
    var query = db.Anime.AsQueryable();

    if (!string.IsNullOrWhiteSpace(search))
    {
        query = query.Where(a => EF.Functions.ILike(a.Title, $"%{search}%"));
    }

    if (!string.IsNullOrWhiteSpace(genre))
    {
        query = query.Where(a => EF.Functions.ILike(a.Genre, $"%{genre}%"));
    }

    query = sort switch
    {
        "rating_desc" => query.OrderByDescending(a => a.AniListScore ?? 0),
        "rating_asc" => query.OrderBy(a => a.AniListScore ?? 0),
        "title_asc" => query.OrderBy(a => a.Title),
        "title_desc" => query.OrderByDescending(a => a.Title),
        _ => query.OrderBy(a => a.Id)
    };

    var totalCount = await query.CountAsync();

    var items = await query
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .ToListAsync();

    return Results.Ok(new
    {
        items,
        page,
        pageSize,
        totalCount,
        totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
    });
})
.WithName("GetAllAnime");

app.MapGet("/api/characters", async (AppDbContext db, int page = 1, int pageSize = 32, string? search = null) =>
{
    var query = db.CastMember.AsQueryable();

    if (!string.IsNullOrWhiteSpace(search))
    {
        query = query.Where(c =>
            EF.Functions.ILike(c.CharacterName, $"%{search}%") ||
            EF.Functions.ILike(c.VoiceActorName, $"%{search}%"));
    }

    var allMatching = await query
        .OrderBy(c => c.Id)
        .ToListAsync();

    var deduped = allMatching
        .GroupBy(c => c.AniListCharacterId)
        .Select(g => g.First())
        .ToList();

    var totalCount = deduped.Count;

    var items = deduped
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .Select(c => new
        {
            c.AniListCharacterId,
            c.CharacterName,
            c.CharacterImageUrl,
            c.VoiceActorName
        })
        .ToList();

    return Results.Ok(new
    {
        items,
        page,
        pageSize,
        totalCount,
        totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
    });
})
.WithName("GetAllCharacters");

app.MapGet("/api/characters/{aniListCharacterId}", async (AppDbContext db, int aniListCharacterId) =>
{
    var animeAppearancesRaw = await db.CastMember
        .Include(c => c.Anime)
        .Where(c => c.AniListCharacterId == aniListCharacterId)
        .ToListAsync();

    var mangaAppearancesRaw = await db.MangaCastMember
        .Include(c => c.Manga)
        .Where(c => c.AniListCharacterId == aniListCharacterId)
        .ToListAsync();

    if (animeAppearancesRaw.Count == 0 && mangaAppearancesRaw.Count == 0)
    {
        return Results.NotFound();
    }

    var first = animeAppearancesRaw.Count > 0
        ? (object)animeAppearancesRaw.First()
        : mangaAppearancesRaw.First();

    string characterName = animeAppearancesRaw.Count > 0
        ? animeAppearancesRaw.First().CharacterName
        : mangaAppearancesRaw.First().CharacterName;
    string? characterImageUrl = animeAppearancesRaw.Count > 0
        ? animeAppearancesRaw.First().CharacterImageUrl
        : mangaAppearancesRaw.First().CharacterImageUrl;
    string? characterDescription = animeAppearancesRaw.Count > 0
        ? animeAppearancesRaw.First().CharacterDescription
        : mangaAppearancesRaw.First().CharacterDescription;
    string voiceActorName = animeAppearancesRaw.Count > 0
        ? animeAppearancesRaw.First().VoiceActorName
        : "N/A";

    var result = new
    {
        aniListCharacterId,
        characterName,
        characterImageUrl,
        characterDescription,
        voiceActorName,
        animeAppearances = animeAppearancesRaw
            .Where(a => a.Anime != null)
            .Select(a => new
            {
                animeId = a.AnimeId,
                title = a.Anime!.Title,
                imageUrl = a.Anime!.ImageUrl
            }),
        mangaAppearances = mangaAppearancesRaw
            .Where(m => m.Manga != null)
            .Select(m => new
            {
                mangaId = m.MangaId,
                title = m.Manga!.Title,
                imageUrl = m.Manga!.ImageUrl
            })
    };

    return Results.Ok(result);
})
.WithName("GetCharacterById");
app.MapGet("/api/anime/{id}", async (AppDbContext db, int id) =>
{
    var anime = await db.Anime
        .Include(a => a.CastMembers)
        .FirstOrDefaultAsync(a => a.Id == id);

    if (anime is null)
    {
        return Results.NotFound();
    }
    return Results.Ok(anime);
})
.WithName("GetAnimeById");

app.MapPost("/api/anime", async (AppDbContext db, Anime anime) =>
{
    db.Anime.Add(anime);
    await db.SaveChangesAsync();
    return Results.Created($"/api/anime/{anime.Id}", anime);
})
.WithName("CreateAnime");

app.MapPut("/api/anime/{id}", async (AppDbContext db, int id, Anime updatedAnime) =>
{
    var anime = await db.Anime.FindAsync(id);
    if (anime is null)
    {
        return Results.NotFound();
    }

    anime.Title = updatedAnime.Title;
    anime.Genre = updatedAnime.Genre;
    anime.Summary = updatedAnime.Summary;

    await db.SaveChangesAsync();
    return Results.Ok(anime);
})
.WithName("UpdateAnime");

app.MapDelete("/api/anime/{id}", async (AppDbContext db, int id) =>
{
    var anime = await db.Anime.FindAsync(id);
    if (anime is null)
    {
        return Results.NotFound();
    }

    db.Anime.Remove(anime);
    await db.SaveChangesAsync();
    return Results.NoContent();
})
.WithName("DeleteAnime");

app.MapPost("/api/anime/import", async (AppDbContext db, IHttpClientFactory httpClientFactory, int pages = 5, int perPage = 25) =>
{
    var client = httpClientFactory.CreateClient("AniList");
    int addedCount = 0;

    for (int page = 1; page <= pages; page++)
    {
        var query = @"
        query ($page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
            media(type: ANIME, sort: POPULARITY_DESC) {
                title { romaji }
                description
                genres
                coverImage { large }
                averageScore
                popularity
                episodes
                status
                format
                studios(isMain: true) { nodes { name } }
                seasonYear
                season
                duration
                characters(sort: ROLE, page: 1, perPage: 6) {
                    edges {
                        node {
                            id
                            name { full }
                            image { large }
                            description
                        }
                        voiceActors(language: JAPANESE) {
                            name { full }
                        }
                    }
                }
            }
        }
    }";

        var requestBody = new { query, variables = new { page, perPage } };
        var httpResponse = await client.PostAsJsonAsync("", requestBody);

        if (!httpResponse.IsSuccessStatusCode)
        {
            break;
        }

        var response = await httpResponse.Content.ReadFromJsonAsync<AniListResponse>();

        if (response is null || response.Data.Page.Media.Count == 0)
        {
            break;
        }

        foreach (var item in response.Data.Page.Media)
        {
            bool exists = await db.Anime.AnyAsync(a => a.Title == item.Title.Romaji);
            if (exists)
            {
                continue;
            }

            var anime = new Anime
            {
                Title = item.Title.Romaji,
                Genre = string.Join(", ", item.Genres),
                Summary = item.Description != null ? StripHtml(item.Description) : "No summary available.",
                ImageUrl = item.CoverImage.Large,
                AniListScore = item.AverageScore,
                Popularity = item.Popularity,
                Episodes = item.Episodes,
                Status = item.Status,
                Format = item.Format,
                Studio = item.Studios.Nodes.Count > 0 ? string.Join(", ", item.Studios.Nodes.Select(s => s.Name)) : null,
                SeasonYear = item.SeasonYear,
                Season = item.Season,
                Duration = item.Duration
            };

            db.Anime.Add(anime);
            await db.SaveChangesAsync(); // ensure anime.Id is populated before adding cast

            foreach (var edge in item.Characters.Edges)
            {
                var voiceActor = edge.VoiceActors.FirstOrDefault();
                db.CastMember.Add(new CastMember
                {
                    AnimeId = anime.Id,
                    AniListCharacterId = edge.Node.Id,
                    CharacterName = edge.Node.Name.Full,
                    CharacterImageUrl = edge.Node.Image.Large,
                    CharacterDescription = edge.Node.Description != null ? CleanCharacterDescription(StripHtml(edge.Node.Description)) : null,
                    VoiceActorName = voiceActor?.Name.Full ?? "Unknown"
                });
            }
            addedCount++;
        }

        await db.SaveChangesAsync();

        // Small delay to stay well within AniList's rate limits between pages
        await Task.Delay(500);
    }

    return Results.Ok(new { imported = addedCount });
})
.WithName("ImportFromAniList");

app.MapPost("/api/manga/import", async (AppDbContext db, IHttpClientFactory httpClientFactory, int pages = 5, int perPage = 25) =>
{
    var client = httpClientFactory.CreateClient("AniList");
    int addedCount = 0;

    for (int page = 1; page <= pages; page++)
    {
            var query = @"
        query ($page: Int, $perPage: Int) {
            Page(page: $page, perPage: $perPage) {
                media(type: MANGA, sort: POPULARITY_DESC) {
                    title { romaji }
                    description
                    genres
                    coverImage { large }
                    averageScore
                    popularity
                    chapters
                    volumes
                    status
                    format
                    startDate { year }
                    characters(sort: ROLE, page: 1, perPage: 6) {
                        edges {
                            node {
                                id
                                name { full }
                                image { large }
                                description
                            }
                        }
                    }
                }
            }
        }";

        var requestBody = new { query, variables = new { page, perPage } };
        var httpResponse = await client.PostAsJsonAsync("", requestBody);

        if (!httpResponse.IsSuccessStatusCode)
        {
            break;
        }

        var response = await httpResponse.Content.ReadFromJsonAsync<AniListResponse>();

        if (response is null || response.Data.Page.Media.Count == 0)
        {
            break;
        }

        foreach (var item in response.Data.Page.Media)
        {
            bool exists = await db.Manga.AnyAsync(m => m.Title == item.Title.Romaji);
            if (exists)
            {
                continue;
            }

            var manga = new Manga
            {
                Title = item.Title.Romaji,
                Genre = string.Join(", ", item.Genres),
                Summary = item.Description != null ? StripHtml(item.Description) : "No summary available.",
                ImageUrl = item.CoverImage.Large,
                AniListScore = item.AverageScore,
                Popularity = item.Popularity,
                Chapters = item.Chapters,
                Volumes = item.Volumes,
                Status = item.Status,
                Format = item.Format,
                StartYear = item.StartDate?.Year
            };

            db.Manga.Add(manga);
            await db.SaveChangesAsync();

            foreach (var edge in item.Characters.Edges)
            {
                db.MangaCastMember.Add(new MangaCastMember
                {
                    MangaId = manga.Id,
                    AniListCharacterId = edge.Node.Id,
                    CharacterName = edge.Node.Name.Full,
                    CharacterImageUrl = edge.Node.Image.Large,
                    CharacterDescription = edge.Node.Description != null ? CleanCharacterDescription(StripHtml(edge.Node.Description)) : null
                });
            }
            addedCount++;
        }

        await db.SaveChangesAsync();
        await Task.Delay(500);
    }

    return Results.Ok(new { imported = addedCount });
})
.WithName("ImportMangaFromAniList");

app.MapGet("/api/manga", async (AppDbContext db, int page = 1, int pageSize = 25, string? search = null, string? genre = null, string? sort = null) =>
{
    var query = db.Manga.AsQueryable();

    if (!string.IsNullOrWhiteSpace(search))
    {
        query = query.Where(m => EF.Functions.ILike(m.Title, $"%{search}%"));
    }

    if (!string.IsNullOrWhiteSpace(genre))
    {
        query = query.Where(m => EF.Functions.ILike(m.Genre, $"%{genre}%"));
    }

    query = sort switch
    {
        "rating_desc" => query.OrderByDescending(m => m.AniListScore ?? 0),
        "rating_asc" => query.OrderBy(m => m.AniListScore ?? 0),
        "title_asc" => query.OrderBy(m => m.Title),
        "title_desc" => query.OrderByDescending(m => m.Title),
        _ => query.OrderBy(m => m.Id)
    };

    var totalCount = await query.CountAsync();

    var items = await query
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .ToListAsync();

    return Results.Ok(new
    {
        items,
        page,
        pageSize,
        totalCount,
        totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
    });
})
.WithName("GetAllManga");

app.MapGet("/api/manga/{id}", async (AppDbContext db, int id) =>
{
    var manga = await db.Manga
        .Include(m => m.MangaCastMembers)
        .FirstOrDefaultAsync(m => m.Id == id);

    if (manga is null)
    {
        return Results.NotFound();
    }
    return Results.Ok(manga);
})
.WithName("GetMangaById");

app.MapGet("/api/manga/{mangaId}/ratings", async (AppDbContext db, int mangaId) =>
{
    return await db.MangaRating.Where(r => r.MangaId == mangaId).ToListAsync();
})
.WithName("GetRatingsForManga");

app.MapPost("/api/manga/{mangaId}/ratings", async (AppDbContext db, int mangaId, MangaRating rating) =>
{
    var mangaExists = await db.Manga.AnyAsync(m => m.Id == mangaId);
    if (!mangaExists)
    {
        return Results.NotFound("Manga not found.");
    }

    rating.MangaId = mangaId;
    db.MangaRating.Add(rating);
    await db.SaveChangesAsync();
    return Results.Created($"/api/manga/{mangaId}/ratings/{rating.Id}", rating);
})
.WithName("CreateMangaRating");

app.MapGet("/api/manga/{mangaId}/rating-summary", async (AppDbContext db, int mangaId) =>
{
    var mangaExists = await db.Manga.AnyAsync(m => m.Id == mangaId);
    if (!mangaExists)
    {
        return Results.NotFound("Manga not found.");
    }

    var ratings = await db.MangaRating.Where(r => r.MangaId == mangaId).ToListAsync();

    if (ratings.Count == 0)
    {
        return Results.Ok(new { mangaId, ratingCount = 0 });
    }

    var summary = new
    {
        mangaId,
        ratingCount = ratings.Count,
        averagePremise = Math.Round(ratings.Average(r => r.Premise), 2),
        averagePlot = Math.Round(ratings.Average(r => r.Plot), 2),
        averageCharacters = Math.Round(ratings.Average(r => r.Characters), 2),
        averageArtStyle = Math.Round(ratings.Average(r => r.ArtStyle), 2),
        averagePacing = Math.Round(ratings.Average(r => r.Pacing), 2),
        averageEnding = Math.Round(ratings.Average(r => r.Ending), 2),
        averageBingeAbility = Math.Round(ratings.Average(r => r.BingeAbility), 2),
        overallScore = Math.Round(ratings.Average(r => r.OverallScore), 2)
    };

    return Results.Ok(summary);
})
.WithName("GetMangaRatingSummary");

app.MapGet("/api/readinglist", async (AppDbContext db) =>
{
    return await db.ReadingListEntry.Include(r => r.Manga).ToListAsync();
})
.WithName("GetReadingList");

app.MapPost("/api/readinglist", async (AppDbContext db, ReadingListEntry entry) =>
{
    var mangaExists = await db.Manga.AnyAsync(m => m.Id == entry.MangaId);
    if (!mangaExists)
    {
        return Results.NotFound("Manga not found.");
    }

    var existing = await db.ReadingListEntry.FirstOrDefaultAsync(r => r.MangaId == entry.MangaId);
    if (existing is not null)
    {
        existing.Status = entry.Status;
        await db.SaveChangesAsync();
        return Results.Ok(existing);
    }

    db.ReadingListEntry.Add(entry);
    await db.SaveChangesAsync();
    return Results.Created($"/api/readinglist/{entry.Id}", entry);
})
.WithName("AddOrUpdateReadingListEntry");

app.MapDelete("/api/readinglist/{mangaId}", async (AppDbContext db, int mangaId) =>
{
    var entry = await db.ReadingListEntry.FirstOrDefaultAsync(r => r.MangaId == mangaId);
    if (entry is null)
    {
        return Results.NotFound();
    }

    db.ReadingListEntry.Remove(entry);
    await db.SaveChangesAsync();
    return Results.NoContent();
})
.WithName("RemoveFromReadingList");

app.MapGet("/api/anime/{animeId}/ratings", async (AppDbContext db, int animeId) =>
 {
     return await db.Rating.Where(r => r.AnimeId == animeId).ToListAsync();
 })
.WithName("GetRatingsForAnime");

app.MapPost("/api/anime/{animeId}/ratings", async (AppDbContext db, int animeId, Rating rating) =>
{
    var animeExists = await db.Anime.AnyAsync(a => a.Id == animeId);
    if (!animeExists)
    {
        return Results.NotFound("Anime not found.");
    }

    rating.AnimeId = animeId;
    db.Rating.Add(rating);
    await db.SaveChangesAsync();
    return Results.Created($"/api/anime/{animeId}/ratings/{rating.Id}", rating);
})
.WithName("CreateRating");

app.MapGet("/api/anime/{animeId}/rating-summary", async (AppDbContext db, int animeId) =>
{
    var animeExists = await db.Anime.AnyAsync(a => a.Id == animeId);
    if (!animeExists)
    {
        return Results.NotFound("Anime not found.");
    }

    var ratings = await db.Rating.Where(r => r.AnimeId == animeId).ToListAsync();

    if (ratings.Count == 0)
    {
        return Results.Ok(new { animeId, ratingCount = 0 });
    }

    var summary = new
    {
        animeId,
        ratingCount = ratings.Count,
        averagePremise = Math.Round(ratings.Average(r => r.Premise), 2),
        averagePlot = Math.Round(ratings.Average(r => r.Plot), 2),
        averageCharacters = Math.Round(ratings.Average(r => r.Characters), 2),
        averageArtStyle = Math.Round(ratings.Average(r => r.ArtStyle), 2),
        averageAnimation = Math.Round(ratings.Average(r => r.Animation), 2),
        averagePacing = Math.Round(ratings.Average(r => r.Pacing), 2),
        averageEnding = Math.Round(ratings.Average(r => r.Ending), 2),
        averageBingeAbility = Math.Round(ratings.Average(r => r.BingeAbility), 2),
        overallScore = Math.Round(ratings.Average(r => r.OverallScore), 2)
    };

    return Results.Ok(summary);
})
.WithName("GetRatingSummary");

app.MapGet("/api/anime/hottest", async (IHttpClientFactory httpClientFactory) =>
{
    var client = httpClientFactory.CreateClient("AniList");
    var currentYear = DateTime.UtcNow.Year;

    var query = @"
    query ($year: Int) {
        Page(perPage: 25) {
            media(type: ANIME, seasonYear: $year, sort: POPULARITY_DESC) {
                id
                title { romaji }
                description
                genres
                coverImage { large }
                averageScore
                popularity
            }
        }
    }";

    var requestBody = new
    {
        query,
        variables = new { year = currentYear }
    };

    var httpResponse = await client.PostAsJsonAsync("", requestBody);
    httpResponse.EnsureSuccessStatusCode();

    var response = await httpResponse.Content.ReadFromJsonAsync<AniListResponse>();

    if (response is null)
    {
        return Results.Problem("No data returned from AniList.");
    }

    var hottestList = response.Data.Page.Media.Select(item => new
    {
        anilistId = item.Id,
        title = item.Title.Romaji,
        genre = string.Join(", ", item.Genres),
        summary = item.Description != null ? StripHtml(item.Description) : "No summary available.",
        imageUrl = item.CoverImage.Large,
        aniListScore = item.AverageScore,
        popularity = item.Popularity
    });

    return Results.Ok(hottestList);
})
.WithName("GetHottestAnimeOfYear");

app.MapGet("/api/anime/trending", async (IHttpClientFactory httpClientFactory) =>
{
    var client = httpClientFactory.CreateClient("AniList");

    var query = @"
        query {
            Page(perPage: 25) {
                media(type: ANIME, sort: TRENDING_DESC) {
                    id
                    title { romaji }
                    description
                    genres
                    coverImage { large }
                    averageScore
                    popularity
                }
            }
        }";

    var requestBody = new { query };
    var httpResponse = await client.PostAsJsonAsync("", requestBody);
    httpResponse.EnsureSuccessStatusCode();

    var response = await httpResponse.Content.ReadFromJsonAsync<AniListResponse>();

    if (response is null)
    {
        return Results.Problem("No data returned from AniList.");
    }

    var trendingList = response.Data.Page.Media.Select(item => new
    {
        anilistId = item.Id,
        title = item.Title.Romaji,
        genre = string.Join(", ", item.Genres),
        summary = item.Description != null ? StripHtml(item.Description) : "No summary available.",
        imageUrl = item.CoverImage.Large,
        aniListScore = item.AverageScore,
        popularity = item.Popularity
    });

    return Results.Ok(trendingList);
})
.WithName("GetTrendingAnime");

app.MapGet("/api/watchlist", async (AppDbContext db) =>
{
    return await db.WatchlistEntry.Include(w => w.Anime).ToListAsync();
})
.WithName("GetWatchlist");

app.MapPost("/api/watchlist", async (AppDbContext db, WatchlistEntry entry) =>
{
    var animeExists = await db.Anime.AnyAsync(a => a.Id == entry.AnimeId);
    if (!animeExists)
    {
        return Results.NotFound("Anime not found.");
    }

    var existing = await db.WatchlistEntry.FirstOrDefaultAsync(w => w.AnimeId == entry.AnimeId);
    if (existing is not null)
    {
        existing.Status = entry.Status;
        await db.SaveChangesAsync();
        return Results.Ok(existing);
    }

    db.WatchlistEntry.Add(entry);
    await db.SaveChangesAsync();
    return Results.Created($"/api/watchlist/{entry.Id}", entry);
})
.WithName("AddOrUpdateWatchlistEntry");

app.MapDelete("/api/watchlist/{animeId}", async (AppDbContext db, int animeId) =>
{
    var entry = await db.WatchlistEntry.FirstOrDefaultAsync(w => w.AnimeId == animeId);
    if (entry is null)
    {
        return Results.NotFound();
    }

    db.WatchlistEntry.Remove(entry);
    await db.SaveChangesAsync();
    return Results.NoContent();
})
.WithName("RemoveFromWatchlist");

app.MapPost("/api/anime/import-one/{anilistId}", async (AppDbContext db, IHttpClientFactory httpClientFactory, int anilistId) =>
{
    var client = httpClientFactory.CreateClient("AniList");

    var query = @"
        query ($id: Int) {
            Media(id: $id, type: ANIME) {
            title { romaji }
            description
            genres
            coverImage { large }
            averageScore
            popularity
            episodes
            status
            format
            studios(isMain: true) { nodes { name } }
            seasonYear
            season
            duration
            characters(sort: ROLE, page: 1, perPage: 6) {
                edges {
                    node {
                        id
                        name { full }
                        image { large }
                        description
                    }
                    voiceActors(language: JAPANESE) {
                        name { full }
                    }
                }
            }
        }
    }";

    var requestBody = new { query, variables = new { id = anilistId } };
    var httpResponse = await client.PostAsJsonAsync("", requestBody);
    httpResponse.EnsureSuccessStatusCode();

    var json = await httpResponse.Content.ReadFromJsonAsync<JsonElement>();
    var mediaElement = json.GetProperty("data").GetProperty("Media");

    var title = mediaElement.GetProperty("title").GetProperty("romaji").GetString() ?? "Untitled";

    var existing = await db.Anime.FirstOrDefaultAsync(a => a.Title == title);
    if (existing is not null)
    {
        return Results.Ok(existing);
    }

    var genres = mediaElement.GetProperty("genres").EnumerateArray().Select(g => g.GetString()).ToList();
    var description = mediaElement.TryGetProperty("description", out var descProp) ? descProp.GetString() : null;
    var imageUrl = mediaElement.GetProperty("coverImage").GetProperty("large").GetString();
    var averageScore = mediaElement.TryGetProperty("averageScore", out var scoreProp) && scoreProp.ValueKind != JsonValueKind.Null
        ? scoreProp.GetInt32()
        : (int?)null;
    var popularity = mediaElement.TryGetProperty("popularity", out var popProp) && popProp.ValueKind != JsonValueKind.Null
        ? popProp.GetInt32()
        : (int?)null;

    var anime = new Anime
    {
        Title = title,
        Genre = string.Join(", ", genres),
        Summary = description != null ? StripHtml(description) : "No summary available.",
        ImageUrl = imageUrl,
        AniListScore = averageScore,
        Popularity = popularity
    };

    db.Anime.Add(anime);
    await db.SaveChangesAsync();
    if (mediaElement.TryGetProperty("characters", out var charactersProp) && charactersProp.TryGetProperty("edges", out var edgesProp))
    {
        foreach (var edge in edgesProp.EnumerateArray())
        {
            var node = edge.GetProperty("node");
            var characterId = node.GetProperty("id").GetInt32();
            var characterName = node.GetProperty("name").GetProperty("full").GetString() ?? "Unknown";
            var characterImageUrl = node.TryGetProperty("image", out var imgProp) && imgProp.TryGetProperty("large", out var largeProp)
                ? largeProp.GetString() : null;
            var characterDescription = node.TryGetProperty("description", out var descProp2) && descProp2.ValueKind != JsonValueKind.Null
            ? CleanCharacterDescription(StripHtml(descProp2.GetString() ?? "")) : null;

            string voiceActorName = "Unknown";
            if (edge.TryGetProperty("voiceActors", out var vaProp) && vaProp.GetArrayLength() > 0)
            {
                voiceActorName = vaProp[0].GetProperty("name").GetProperty("full").GetString() ?? "Unknown";
            }

            db.CastMember.Add(new CastMember
            {
                AnimeId = anime.Id,
                AniListCharacterId = characterId,
                CharacterName = characterName,
                CharacterImageUrl = characterImageUrl,
                CharacterDescription = characterDescription,
                VoiceActorName = voiceActorName
            });
        }

        await db.SaveChangesAsync();
    }
    return Results.Ok(anime);
})
.WithName("ImportSingleAnime");

app.Run();

