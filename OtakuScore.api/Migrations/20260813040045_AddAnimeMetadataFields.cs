using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OtakuScore.api.Migrations
{
    /// <inheritdoc />
    public partial class AddAnimeMetadataFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Duration",
                table: "Anime",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Episodes",
                table: "Anime",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Format",
                table: "Anime",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Season",
                table: "Anime",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SeasonYear",
                table: "Anime",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Anime",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Studio",
                table: "Anime",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Duration",
                table: "Anime");

            migrationBuilder.DropColumn(
                name: "Episodes",
                table: "Anime");

            migrationBuilder.DropColumn(
                name: "Format",
                table: "Anime");

            migrationBuilder.DropColumn(
                name: "Season",
                table: "Anime");

            migrationBuilder.DropColumn(
                name: "SeasonYear",
                table: "Anime");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Anime");

            migrationBuilder.DropColumn(
                name: "Studio",
                table: "Anime");
        }
    }
}
