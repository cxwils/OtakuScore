using Microsoft.EntityFrameworkCore;
using OtakuScore.api.Data;
using OtakuScore.api.Models;

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

app.MapGet("/api/anime", async (AppDbContext db) =>
{
    return await db.Anime.ToListAsync();
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

app.MapPost("/api/anime/import", async (AppDbContext db, IHttpClientFactory httpClientFactory) =>
{
    var client = httpClientFactory.CreateClient("AniList");

    var query = @"
    query {
        Page(perPage: 10) {
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



    var requestBody = new { query };
    var httpResponse = await client.PostAsJsonAsync("", requestBody);
    httpResponse.EnsureSuccessStatusCode();

    var response = await httpResponse.Content.ReadFromJsonAsync<AniListResponse>();

    if (response is null || response.Data.Page.Media.Count == 0)
    {
        return Results.Problem("No data returned from AniList.");
    }

    int addedCount = 0;

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

app.Run();

