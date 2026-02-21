using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MedEquity.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "patient_sessions",
                columns: table => new
                {
                    session_id = table.Column<Guid>(type: "uuid", nullable: false),
                    age_range = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    sex = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    geography = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_patient_sessions", x => x.session_id);
                });

            migrationBuilder.CreateTable(
                name: "symptoms",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    session_id = table.Column<Guid>(type: "uuid", nullable: false),
                    symptom_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    severity = table.Column<int>(type: "integer", nullable: false),
                    duration_hours = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_symptoms", x => x.id);
                    table.CheckConstraint("ck_symptoms_severity", "severity >= 1 AND severity <= 10");
                    table.ForeignKey(
                        name: "FK_symptoms_patient_sessions_session_id",
                        column: x => x.session_id,
                        principalTable: "patient_sessions",
                        principalColumn: "session_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "triage_results",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    session_id = table.Column<Guid>(type: "uuid", nullable: false),
                    care_level = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    confidence = table.Column<decimal>(type: "numeric(3,2)", precision: 3, scale: 2, nullable: false),
                    explanation = table.Column<string>(type: "jsonb", nullable: false),
                    model_version = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    human_override = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    nurse_rationale = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_triage_results", x => x.id);
                    table.CheckConstraint("ck_triage_results_care_level", "care_level IN ('Emergency', 'UrgentCare', 'PrimaryCare', 'Telemedicine', 'SelfCare')");
                    table.CheckConstraint("ck_triage_results_confidence", "confidence >= 0 AND confidence <= 1");
                    table.ForeignKey(
                        name: "FK_triage_results_patient_sessions_session_id",
                        column: x => x.session_id,
                        principalTable: "patient_sessions",
                        principalColumn: "session_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_patient_sessions_expires_at",
                table: "patient_sessions",
                column: "expires_at");

            migrationBuilder.CreateIndex(
                name: "ix_symptoms_session_id",
                table: "symptoms",
                column: "session_id");

            migrationBuilder.CreateIndex(
                name: "ix_triage_results_care_level",
                table: "triage_results",
                column: "care_level");

            migrationBuilder.CreateIndex(
                name: "ix_triage_results_created_at",
                table: "triage_results",
                column: "created_at",
                descending: new bool[0]);

            migrationBuilder.CreateIndex(
                name: "ix_triage_results_session_id",
                table: "triage_results",
                column: "session_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "symptoms");

            migrationBuilder.DropTable(
                name: "triage_results");

            migrationBuilder.DropTable(
                name: "patient_sessions");
        }
    }
}
