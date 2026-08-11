using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OtakuScore.api.Migrations
{
    /// <inheritdoc />
    public partial class AddRatingCategories : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Score",
                table: "Rating",
                newName: "Premise");

            migrationBuilder.AddColumn<int>(
                name: "Animation",
                table: "Rating",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ArtStyle",
                table: "Rating",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "BingeAbility",
                table: "Rating",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Characters",
                table: "Rating",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Ending",
                table: "Rating",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Pacing",
                table: "Rating",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Plot",
                table: "Rating",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Animation",
                table: "Rating");

            migrationBuilder.DropColumn(
                name: "ArtStyle",
                table: "Rating");

            migrationBuilder.DropColumn(
                name: "BingeAbility",
                table: "Rating");

            migrationBuilder.DropColumn(
                name: "Characters",
                table: "Rating");

            migrationBuilder.DropColumn(
                name: "Ending",
                table: "Rating");

            migrationBuilder.DropColumn(
                name: "Pacing",
                table: "Rating");

            migrationBuilder.DropColumn(
                name: "Plot",
                table: "Rating");

            migrationBuilder.RenameColumn(
                name: "Premise",
                table: "Rating",
                newName: "Score");
        }
    }
}
