# Otaku Score

A full-stack anime rating platform built with ASP.NET Core, PostgreSQL, and React. Users can browse anime, view detailed rating breakdowns across 8 categories, and see live "hottest of the year" rankings — with anime data sourced from the AniList GraphQL API.

## Tech Stack

- **Backend:** ASP.NET Core Web API (.NET 9), C#
- **Database:** PostgreSQL, Entity Framework Core (code-first migrations)
- **Frontend:** React (Vite), React Router
- **External Data:** AniList GraphQL API

## Features

- Full CRUD API for anime (create, read, update, delete)
- Category-based rating system — Premise, Plot, Characters, Art Style, Animation, Pacing, Ending, and Binge-ability — with a computed overall score
- Per-anime rating summary endpoint with per-category and overall averages
- Automated data ingestion from AniList, with deduplication against existing records and HTML sanitization on descriptions
- Live "Hottest Anime of the Year" endpoint querying AniList directly by current year and popularity
- Single-anime detail pages with full rating breakdown, via client-side routing
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

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/anime` | List all anime |
| GET | `/api/anime/{id}` | Get a single anime by ID |
| POST | `/api/anime` | Create an anime |
| PUT | `/api/anime/{id}` | Update an anime |
| DELETE | `/api/anime/{id}` | Delete an anime |
| POST | `/api/anime/import` | Import anime data from AniList |
| GET | `/api/anime/hottest` | Get top 25 anime of the current year, live from AniList |
| GET | `/api/anime/{animeId}/ratings` | Get ratings for an anime |
| POST | `/api/anime/{animeId}/ratings` | Submit a category rating |
| GET | `/api/anime/{animeId}/rating-summary` | Get per-category and overall average scores |

## Project Status

🚧 In active development. Rating submission UI in progress.

## Author

Christian Wilsey