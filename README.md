# Otaku Score

A full-stack anime and manga rating platform. Browse a searchable, filterable catalog of anime and manga, rate titles across a custom multi-category system, explore cast and character pages, track your watchlist and reading list, and see what's trending — all backed by real user accounts and live data from the AniList GraphQL API.

**🔗 Live demo:** [otaku-score.vercel.app](https://otaku-score.vercel.app)
**🔗 API:** [otakuscore-production.up.railway.app](https://otakuscore-production.up.railway.app)

## Tech Stack

- **Backend:** ASP.NET Core Web API (.NET 9), C#
- **Database:** PostgreSQL, Entity Framework Core (code-first migrations)
- **Auth:** ASP.NET Core Identity + JWT bearer authentication
- **Frontend:** React (Vite), React Router
- **External Data:** AniList GraphQL API
- **Hosting:** Railway (API + Postgres), Vercel (frontend)

## Features

**Catalog & Discovery**
- Full CRUD API for anime and manga, with rich metadata (format, episodes/chapters, duration, status, season, studio)
- Search, genre filtering, and sorting (rating/title, ascending/descending) with backend pagination
- Live "Hottest Anime of the Year" and "Anime of the Week" (trending) views, queried directly from AniList
- Score-based color coding (green/gold/rose) on AniList community scores

**Ratings**
- Custom multi-category rating system — anime rated across 8 categories (Premise, Plot, Characters, Art Style, Animation, Pacing, Ending, Binge-ability), manga across 7 (no Animation) — with a computed overall score
- Per-title rating summary endpoints with per-category and overall averages

**Characters & Cast**
- Cast and character data pulled from AniList, deduplicated across seasons and sequels
- Individual character pages showing bio, voice actor, and every anime/manga appearance, cross-linked back to those titles

**Accounts & Personalization**
- Real user accounts (register/login) with JWT-based authentication
- Per-user Watchlist (anime) and Reading List (manga) with status tracking (Watching/Reading, Plan to Watch/Read, Completed, Dropped)
- Ratings, watchlist, and reading list are all scoped to the logged-in user

**Data Pipeline**
- Automated ingestion from AniList (bulk and single-title imports), with deduplication and HTML/markdown sanitization on descriptions
- ~500 anime and ~500 manga titles imported, each with full metadata and cast

**UI**
- Light/dark theme toggle
- Homepage hero section
- Interactive API documentation via Swagger UI (local/dev only)

## Getting Started

The live demo is linked above — the steps below are for running the project locally.

### Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Node.js](https://nodejs.org/) (for the frontend)

### Backend Setup

```bash
cd OtakuScore.api
dotnet restore
```

Create `appsettings.Development.json` in `OtakuScore.api/` with your local connection string and a JWT signing key:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=otakuscore;Username=postgres;Password=yourpassword"
  },
  "Jwt": {
    "Key": "a-long-random-secret-string-at-least-32-characters"
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

Create a `.env` file in `OtakuScoreFrontend/` pointing at your local API:

```
VITE_API_URL=http://localhost:5094
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

**Anime**

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
| POST 🔒 | `/api/anime/{animeId}/ratings` | Submit a category rating |
| GET | `/api/anime/{animeId}/rating-summary` | Get per-category and overall average scores |

**Manga**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/manga` | List manga (supports `page`, `pageSize`, `search`, `genre`, `sort`) |
| GET | `/api/manga/{id}` | Get a single manga by ID, including cast |
| POST | `/api/manga/import` | Bulk import manga from AniList (`pages`, `perPage`) |
| GET | `/api/manga/{mangaId}/ratings` | Get ratings for a manga |
| POST 🔒 | `/api/manga/{mangaId}/ratings` | Submit a category rating |
| GET | `/api/manga/{mangaId}/rating-summary` | Get per-category and overall average scores |

**Characters**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/characters` | List unique characters (supports `page`, `pageSize`, `search`) |
| GET | `/api/characters/{aniListCharacterId}` | Get a character's bio and all anime/manga appearances |

**Watchlist & Reading List** (🔒 auth required, scoped to the logged-in user)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET 🔒 | `/api/watchlist` | Get your anime watchlist |
| POST 🔒 | `/api/watchlist` | Add or update a watchlist entry |
| DELETE 🔒 | `/api/watchlist/{animeId}` | Remove an anime from your watchlist |
| GET 🔒 | `/api/readinglist` | Get your manga reading list |
| POST 🔒 | `/api/readinglist` | Add or update a reading list entry |
| DELETE 🔒 | `/api/readinglist/{mangaId}` | Remove a manga from your reading list |

**Auth**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create a new account |
| POST | `/api/auth/login` | Log in and receive a JWT |

## Deployment

- **API + Database:** Railway (ASP.NET Core service + managed PostgreSQL)
- **Frontend:** Vercel (Vite build, served as a static site)
- Environment-specific config (connection strings, JWT signing key, allowed CORS origins) is injected via environment variables in both platforms — nothing sensitive is committed to the repo.

## Project Status

🚧 In active development.

## Author

Christian Wilsey