using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MedEquity.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ChangeExplanationToText : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "explanation",
                table: "triage_results",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "jsonb");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "explanation",
                table: "triage_results",
                type: "jsonb",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");
        }
    }
}
