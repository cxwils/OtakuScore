# Otaku Score

A full-stack anime and manga rating platform built with ASP.NET Core, PostgreSQL, and React. Browse a searchable, filterable catalog of anime and manga, rate titles across 7-8 custom categories, explore cast and character pages, track your watchlist and reading list, and see what's trending — all backed by live data from the AniList GraphQL API.

## Tech Stack

- **Backend:** ASP.NET Core Web API (.NET 9), C#
- **Database:** PostgreSQL, Entity Framework Core (code-first migrations)
- **Frontend:** React (Vite), React Router
- **External Data:** AniList GraphQL API

## Features

- Full CRUD API for anime and manga, with rich metadata (format, episodes/chapters, duration, status, season, studio)
- Category-based rating system for both anime (8 categories, including Animation) and manga (7 categories) with a computed overall score
- Per-title rating summary endpoints with per-category and overall averages
- Search, genre filtering, and sorting (rating/title, asc/desc) on both catalogs, with backend pagination
- Cast and character data pulled from AniList, deduplicated across seasons/sequels, with individual character pages showing bio and every anime/manga appearance (cross-linked)
- Automated data ingestion from AniList (bulk and single-title imports), with deduplication and HTML/markdown sanitization
- Live "Hottest Anime of the Year" and "Anime of the Week" (trending) views queried directly from AniList
- Separate Watchlist (anime) and Reading List (manga) with status tracking (Watching/Reading, Plan to Watch/Read, Completed, Dropped)
- Score-based color coding (green/gold/rose) on AniList community scores
- Light/dark theme toggle
- Homepage hero section and persistent GitHub link
- Interactive API documentation via Swagger UI

## Getting Started

### Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Node.js](https://nodejs.org/) (for the frontend)

### Backend Setup

```bash
cd OtakuScore.api
dotnet restore
```

Create `appsettings.Development.json` in `OtakuScore.api/` with your local connection string:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=otakuscore;Username=postgres;Password=yourpassword"
  }
}
```

Then create the database and apply migrations:

```bash
dotnet ef database update
dotnet run
```

The API will be available at `http://localhost:5094`, with Swagger UI at `http://localhost:5094/swagger`.

### Frontend Setup

```bash
cd OtakuScoreFrontend
npm install
npm run dev
```

The site will be available at `http://localhost:5173`.

### Seeding Data

Once the backend is running, import anime and manga from AniList via Swagger:

```
POST /api/anime/import?pages=10&perPage=50
POST /api/manga/import?pages=10&perPage=50
```

This pulls the most popular titles (with metadata, cast, and characters) into your local database. Adjust `pages`/`perPage` to control how many titles are imported.

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/anime` | List anime (supports `page`, `pageSize`, `search`, `genre`, `sort`) |
| GET | `/api/anime/{id}` | Get a single anime by ID, including cast |
| POST | `/api/anime` | Create an anime |
| PUT | `/api/anime/{id}` | Update an anime |
| DELETE | `/api/anime/{id}` | Delete an anime |
| POST | `/api/anime/import` | Bulk import anime from AniList (`pages`, `perPage`) |
| POST | `/api/anime/import-one/{anilistId}` | Import a single anime from AniList |
| GET | `/api/anime/hottest` | Top 25 anime of the current year, live from AniList |
| GET | `/api/anime/trending` | Top 25 trending anime this week, live from AniList |
| GET | `/api/anime/{animeId}/ratings` | Get ratings for an anime |
| POST | `/api/anime/{animeId}/ratings` | Submit a category rating |
| GET | `/api/anime/{animeId}/rating-summary` | Get per-category and overall average scores |
| GET | `/api/manga` | List manga (supports `page`, `pageSize`, `search`, `genre`, `sort`) |
| GET | `/api/manga/{id}` | Get a single manga by ID, including cast |
| POST | `/api/manga/import` | Bulk import manga from AniList (`pages`, `perPage`) |
| GET | `/api/manga/{mangaId}/ratings` | Get ratings for a manga |
| POST | `/api/manga/{mangaId}/ratings` | Submit a category rating |
| GET | `/api/manga/{mangaId}/rating-summary` | Get per-category and overall average scores |
| GET | `/api/characters` | List unique characters (supports `page`, `pageSize`, `search`) |
| GET | `/api/characters/{aniListCharacterId}` | Get a character's bio and all anime/manga appearances |
| GET | `/api/watchlist` | Get the current anime watchlist |
| POST | `/api/watchlist` | Add or update a watchlist entry |
| DELETE | `/api/watchlist/{animeId}` | Remove an anime from the watchlist |
| GET | `/api/readinglist` | Get the current manga reading list |
| POST | `/api/readinglist` | Add or update a reading list entry |
| DELETE | `/api/readinglist/{mangaId}` | Remove a manga from the reading list |

## Author

Christian Wilsey