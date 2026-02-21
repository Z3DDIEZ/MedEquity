using MedEquity.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MedEquity.Infrastructure.Data.Configurations;

/// <summary>
/// EF Core configuration for TriageResult entity.
/// Immutable once created — audit trail for all triage decisions.
/// </summary>
public class TriageResultConfiguration : IEntityTypeConfiguration<TriageResult>
{
    public void Configure(EntityTypeBuilder<TriageResult> builder)
    {
        builder.ToTable("triage_results", t =>
        {
            t.HasCheckConstraint("ck_triage_results_confidence", "confidence >= 0 AND confidence <= 1");
            t.HasCheckConstraint("ck_triage_results_care_level",
                "care_level IN ('Emergency', 'UrgentCare', 'PrimaryCare', 'Telemedicine', 'SelfCare')");
        });

        builder.HasKey(tr => tr.Id);

        builder.Property(tr => tr.Id)
            .HasColumnName("id");

        builder.Property(tr => tr.SessionId)
            .HasColumnName("session_id")
            .IsRequired();

        builder.Property(tr => tr.CareLevel)
            .HasColumnName("care_level")
            .HasMaxLength(50)
            .HasConversion<string>()
            .IsRequired();

        builder.Property(tr => tr.Confidence)
            .HasColumnName("confidence")
            .HasPrecision(3, 2)
            .IsRequired();

        builder.Property(tr => tr.Explanation)
            .HasColumnName("explanation")
            .HasColumnType("text")
            .IsRequired();

        builder.Property(tr => tr.ModelVersion)
            .HasColumnName("model_version")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(tr => tr.HumanOverride)
            .HasColumnName("human_override")
            .HasDefaultValue(false);

        builder.Property(tr => tr.NurseRationale)
            .HasColumnName("nurse_rationale");

        builder.Property(tr => tr.CreatedAt)
            .HasColumnName("created_at")
            .HasDefaultValueSql("NOW()");

        // Indexes
        builder.HasIndex(tr => tr.SessionId)
            .HasDatabaseName("ix_triage_results_session_id");

        builder.HasIndex(tr => tr.CareLevel)
            .HasDatabaseName("ix_triage_results_care_level");

        builder.HasIndex(tr => tr.CreatedAt)
            .HasDatabaseName("ix_triage_results_created_at")
            .IsDescending();
    }
}
