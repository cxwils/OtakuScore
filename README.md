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