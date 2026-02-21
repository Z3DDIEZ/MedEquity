using MedEquity.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MedEquity.Infrastructure.Data.Configurations;

/// <summary>
/// EF Core configuration for PatientSession entity.
/// Matches the schema from the System Architecture Specification.
/// </summary>
public class PatientSessionConfiguration : IEntityTypeConfiguration<PatientSession>
{
    public void Configure(EntityTypeBuilder<PatientSession> builder)
    {
        builder.ToTable("patient_sessions");

        builder.HasKey(ps => ps.SessionId);

        builder.Property(ps => ps.SessionId)
            .HasColumnName("session_id");

        builder.Property(ps => ps.AgeRange)
            .HasColumnName("age_range")
            .HasMaxLength(10)
            .IsRequired();

        builder.Property(ps => ps.Sex)
            .HasColumnName("sex")
            .HasMaxLength(10)
            .IsRequired();

        builder.Property(ps => ps.Geography)
            .HasColumnName("geography")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(ps => ps.CreatedAt)
            .HasColumnName("created_at")
            .HasDefaultValueSql("NOW()");

        builder.Property(ps => ps.ExpiresAt)
            .HasColumnName("expires_at");

        // Relationships
        builder.HasMany(ps => ps.Symptoms)
            .WithOne()
            .HasForeignKey(s => s.SessionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(ps => ps.TriageResults)
            .WithOne()
            .HasForeignKey(tr => tr.SessionId)
            .OnDelete(DeleteBehavior.Cascade);

        // Index for expired session cleanup
        builder.HasIndex(ps => ps.ExpiresAt)
            .HasDatabaseName("ix_patient_sessions_expires_at");
    }
}
