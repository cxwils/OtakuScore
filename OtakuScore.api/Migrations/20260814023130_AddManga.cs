using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace OtakuScore.api.Migrations
{
    /// <inheritdoc />
    public partial class AddManga : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Manga",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Genre = table.Column<string>(type: "text", nullable: false),
                    Summary = table.Column<string>(type: "text", nullable: false),
                    ImageUrl = table.Column<string>(type: "text", nullable: true),
                    AniListScore = table.Column<int>(type: "integer", nullable: true),
                    Popularity = table.Column<int>(type: "integer", nullable: true),
                    Chapters = table.Column<int>(type: "integer", nullable: true),
                    Volumes = table.Column<int>(type: "integer", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: true),
                    Format = table.Column<string>(type: "text", nullable: true),
                    StartYear = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Manga", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MangaRating",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MangaId = table.Column<int>(type: "integer", nullable: false),
                    Premise = table.Column<int>(type: "integer", nullable: false),
                    Plot = table.Column<int>(type: "integer", nullable: false),
                    Characters = table.Column<int>(type: "integer", nullable: false),
                    ArtStyle = table.Column<int>(type: "integer", nullable: false),
                    Pacing = table.Column<int>(type: "integer", nullable: false),
                    Ending = table.Column<int>(type: "integer", nullable: false),
                    BingeAbility = table.Column<int>(type: "integer", nullable: false),
                    Review = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MangaRating", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MangaRating_Manga_MangaId",
                        column: x => x.MangaId,
                        principalTable: "Manga",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ReadingListEntry",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MangaId = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReadingListEntry", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReadingListEntry_Manga_MangaId",
                        column: x => x.MangaId,
                        principalTable: "Manga",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MangaRating_MangaId",
                table: "MangaRating",
                column: "MangaId");

            migrationBuilder.CreateIndex(
                name: "IX_ReadingListEntry_MangaId",
                table: "ReadingListEntry",
                column: "MangaId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MangaRating");

            migrationBuilder.DropTable(
                name: "ReadingListEntry");

            migrationBuilder.DropTable(
                name: "Manga");
        }
    }
}
