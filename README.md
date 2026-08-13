# Otaku Score

A full-stack anime rating platform built with ASP.NET Core, PostgreSQL, and React. Browse a searchable, filterable catalog of anime, view detailed rating breakdowns across 8 categories, explore cast and character pages, and track your own watchlist — with data sourced live from the AniList GraphQL API.

## Tech Stack

- **Backend:** ASP.NET Core Web API (.NET 9), C#
- **Database:** PostgreSQL, Entity Framework Core (code-first migrations)
- **Frontend:** React (Vite), React Router
- **External Data:** AniList GraphQL API

## Features

- Full CRUD API for anime, with rich metadata (format, episodes, duration, status, season, studio)
- Category-based rating system — Premise, Plot, Characters, Art Style, Animation, Pacing, Ending, and Binge-ability — with a computed overall score
- Per-anime rating summary endpoint with per-category and overall averages
- Search, genre filtering, and sorting (rating/title, asc/desc) on the anime catalog, with backend pagination
- Cast and character data pulled from AniList, deduplicated across seasons/sequels, with individual character pages showing bio, voice actor, and every anime they appear in
- Automated data ingestion from AniList (bulk and single-anime imports), with deduplication and HTML/markdown sanitization on descriptions
- Live "Hottest Anime of the Year" endpoint querying AniList directly by current year and popularity
- Single-user Watchlist (Watching / Plan to Watch / Completed / Dropped) with add, update, and remove
- Score-based color coding (green/gold/rose) on AniList community scores
- Light/dark theme toggle
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
cd anime-rater-web
npm install
npm run dev
```

The site will be available at `http://localhost:5173`.

### Seeding Data

Once the backend is running, import anime from AniList via Swagger:

```
POST /api/anime/import?pages=10&perPage=50
```

This pulls the most popular anime (with metadata, cast, and characters) into your local database. Adjust `pages`/`perPage` to control how many titles are imported.

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
| GET | `/api/anime/{animeId}/ratings` | Get ratings for an anime |
| POST | `/api/anime/{animeId}/ratings` | Submit a category rating |
| GET | `/api/anime/{animeId}/rating-summary` | Get per-category and overall average scores |
| GET | `/api/characters` | List unique characters (supports `page`, `pageSize`, `search`) |
| GET | `/api/characters/{aniListCharacterId}` | Get a character's bio, voice actor, and anime appearances |
| GET | `/api/watchlist` | Get the current watchlist |
| POST | `/api/watchlist` | Add or update a watchlist entry |
| DELETE | `/api/watchlist/{animeId}` | Remove an anime from the watchlist |

## Project Status

🚧 In active development.

## Author

Christian Wilsey