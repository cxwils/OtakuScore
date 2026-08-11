using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OtakuScore.api.Migrations
{
    /// <inheritdoc />
    public partial class AddAniListScoreAndPopularity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AniListScore",
                table: "Anime",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Popularity",
                table: "Anime",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AniListScore",
                table: "Anime");

            migrationBuilder.DropColumn(
                name: "Popularity",
                table: "Anime");
        }
    }
}
