using MedEquity.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MedEquity.Infrastructure.Data.Configurations;

/// <summary>
/// EF Core configuration for Symptom entity.
/// Enforces severity range constraint and indexes for session lookup.
/// </summary>
public class SymptomConfiguration : IEntityTypeConfiguration<Symptom>
{
    public void Configure(EntityTypeBuilder<Symptom> builder)
    {
        builder.ToTable("symptoms", t =>
        {
            t.HasCheckConstraint("ck_symptoms_severity", "severity >= 1 AND severity <= 10");
        });

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Id)
            .HasColumnName("id");

        builder.Property(s => s.SessionId)
            .HasColumnName("session_id")
            .IsRequired();

        builder.Property(s => s.SymptomCode)
            .HasColumnName("symptom_code")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(s => s.Severity)
            .HasColumnName("severity")
            .IsRequired();

        builder.Property(s => s.DurationHours)
            .HasColumnName("duration_hours")
            .IsRequired();

        // Index for session lookup
        builder.HasIndex(s => s.SessionId)
            .HasDatabaseName("ix_symptoms_session_id");
    }
}
