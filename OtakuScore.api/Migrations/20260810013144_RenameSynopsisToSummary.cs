using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OtakuScore.api.Migrations
{
    /// <inheritdoc />
    public partial class RenameSynopsisToSummary : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Synopsis",
                table: "Anime",
                newName: "Summary");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Summary",
                table: "Anime",
                newName: "Synopsis");
        }
    }
}
