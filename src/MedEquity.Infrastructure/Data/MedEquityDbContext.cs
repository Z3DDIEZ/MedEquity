using MedEquity.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace MedEquity.Infrastructure.Data;

/// <summary>
/// Entity Framework Core database context for MedEquity.
/// Configured for PostgreSQL with POPIA-compliant data retention policies.
/// </summary>
public class MedEquityDbContext : DbContext
{
    public DbSet<PatientSession> PatientSessions => Set<PatientSession>();
    public DbSet<Symptom> Symptoms => Set<Symptom>();
    public DbSet<TriageResult> TriageResults => Set<TriageResult>();

    public MedEquityDbContext(DbContextOptions<MedEquityDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(MedEquityDbContext).Assembly);
    }
}
