using MedEquity.Core.Common;

namespace MedEquity.Core.Entities;

/// <summary>
/// Represents a single symptom reported during a triage session.
/// Uses SNOMED CT codes for interoperability with health systems.
/// </summary>
public class Symptom
{
    /// <summary>Unique identifier for this symptom entry.</summary>
    public Guid Id { get; private set; }

    /// <summary>Foreign key to the parent patient session.</summary>
    public Guid SessionId { get; private set; }

    /// <summary>SNOMED CT code identifying the symptom (e.g. "386661006" for fever).</summary>
    public string SymptomCode { get; private set; } = string.Empty;

    /// <summary>Patient-reported severity on a 1-10 scale.</summary>
    public int Severity { get; private set; }

    /// <summary>Duration of the symptom in hours.</summary>
    public int DurationHours { get; private set; }

    /// <summary>Private constructor for EF Core materialization.</summary>
    private Symptom() { }

    /// <summary>
    /// Creates a new symptom record with validated inputs.
    /// </summary>
    /// <param name="sessionId">The parent session ID.</param>
    /// <param name="symptomCode">SNOMED CT code for the symptom.</param>
    /// <param name="severity">Severity on 1-10 scale.</param>
    /// <param name="durationHours">Duration in hours (must be non-negative).</param>
    /// <returns>A Result containing the symptom on success, or an error on failure.</returns>
    public static Result<Symptom> Create(
        Guid sessionId,
        string symptomCode,
        int severity,
        int durationHours)
    {
        if (sessionId == Guid.Empty)
            return Result<Symptom>.Failure("Session ID is required.");

        if (string.IsNullOrWhiteSpace(symptomCode))
            return Result<Symptom>.Failure("Symptom code is required.");

        if (severity < 1 || severity > 10)
            return Result<Symptom>.Failure("Severity must be between 1 and 10.");

        if (durationHours < 0)
            return Result<Symptom>.Failure("Duration hours must be non-negative.");

        var symptom = new Symptom
        {
            Id = Guid.NewGuid(),
            SessionId = sessionId,
            SymptomCode = symptomCode.Trim(),
            Severity = severity,
            DurationHours = durationHours
        };

        return Result<Symptom>.Success(symptom);
    }
}
