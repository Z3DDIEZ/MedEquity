using MedEquity.Core.Common;

namespace MedEquity.Core.Entities;

/// <summary>
/// Represents an ephemeral patient triage session. Contains NO personally identifiable
/// information — only bucketed demographics for clinical accuracy and fairness monitoring.
/// Auto-expires after 7 days per POPIA compliance.
/// </summary>
public class PatientSession
{
    /// <summary>Cryptographically random session identifier. No linkage to patient identity.</summary>
    public Guid SessionId { get; private set; }

    /// <summary>Bucketed age range for clinical relevance (e.g. "20-30", "30-40").</summary>
    public string AgeRange { get; private set; } = string.Empty;

    /// <summary>Biological sex for clinical accuracy only (e.g. "Male", "Female", "Other").</summary>
    public string Sex { get; private set; } = string.Empty;

    /// <summary>District-level geography, not precise address (e.g. "Johannesburg Metro").</summary>
    public string Geography { get; private set; } = string.Empty;

    /// <summary>Timestamp of session creation.</summary>
    public DateTime CreatedAt { get; private set; }

    /// <summary>Automatic expiry timestamp. Data MUST be deleted after this point.</summary>
    public DateTime ExpiresAt { get; private set; }

    // Navigation properties
    private readonly List<Symptom> _symptoms = [];
    public IReadOnlyList<Symptom> Symptoms => _symptoms.AsReadOnly();

    private readonly List<TriageResult> _triageResults = [];
    public IReadOnlyList<TriageResult> TriageResults => _triageResults.AsReadOnly();

    /// <summary>Private constructor for EF Core materialization.</summary>
    private PatientSession() { }

    /// <summary>
    /// Creates a new patient session with validated inputs and automatic 7-day expiry.
    /// </summary>
    /// <param name="ageRange">Bucketed age range (e.g. "20-30"). Required.</param>
    /// <param name="sex">Biological sex for clinical accuracy. Required.</param>
    /// <param name="geography">District-level geography. Required.</param>
    /// <returns>A Result containing the session on success, or an error message on failure.</returns>
    public static Result<PatientSession> Create(string ageRange, string sex, string geography)
    {
        if (string.IsNullOrWhiteSpace(ageRange))
            return Result<PatientSession>.Failure("Age range is required.");

        if (string.IsNullOrWhiteSpace(sex))
            return Result<PatientSession>.Failure("Sex is required.");

        if (string.IsNullOrWhiteSpace(geography))
            return Result<PatientSession>.Failure("Geography is required.");

        var now = DateTime.UtcNow;

        var session = new PatientSession
        {
            SessionId = Guid.NewGuid(),
            AgeRange = ageRange.Trim(),
            Sex = sex.Trim(),
            Geography = geography.Trim(),
            CreatedAt = now,
            ExpiresAt = now.AddDays(7)
        };

        return Result<PatientSession>.Success(session);
    }

    /// <summary>Checks whether this session has expired and should be deleted.</summary>
    public bool IsExpired() => DateTime.UtcNow >= ExpiresAt;
}
