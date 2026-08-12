using Microsoft.EntityFrameworkCore;
using OtakuScore.api.Data;
using OtakuScore.api.Models;
using System.Text.Json;

static string StripHtml(string input)
{
    return System.Text.RegularExpressions.Regex.Replace(input, "<.*?>", " ").Trim();
}

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
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

app.MapGet("/api/anime", async (AppDbContext db, int page = 1, int pageSize = 25) =>
{
    var totalCount = await db.Anime.CountAsync();

    var items = await db.Anime
        .OrderBy(a => a.Id)
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

app.MapGet("/api/anime/{id}", async (AppDbContext db, int id) =>
{
    var anime = await db.Anime.FindAsync(id);
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
                Popularity = item.Popularity
            };

            db.Anime.Add(anime);
            addedCount++;
        }

        await db.SaveChangesAsync();

        // Small delay to stay well within AniList's rate limits between pages
        await Task.Delay(500);
    }

    return Results.Ok(new { imported = addedCount });
})
.WithName("ImportFromAniList");

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

    return Results.Ok(anime);
})
.WithName("ImportSingleAnime");

app.Run();

