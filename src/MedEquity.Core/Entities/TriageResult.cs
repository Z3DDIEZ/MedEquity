using MedEquity.Core.Common;
using MedEquity.Core.Enums;

namespace MedEquity.Core.Entities;

/// <summary>
/// Represents the outcome of a triage analysis for a patient session.
/// This is a navigation recommendation (care setting), NOT a medical diagnosis.
/// Immutable once created — stored as part of the audit trail.
/// </summary>
public class TriageResult
{
    /// <summary>Unique identifier for this triage result.</summary>
    public Guid Id { get; private set; }

    /// <summary>Foreign key to the parent patient session.</summary>
    public Guid SessionId { get; private set; }

    /// <summary>Recommended care setting (Emergency, UrgentCare, etc.).</summary>
    public CareLevel CareLevel { get; private set; }

    /// <summary>Model confidence in the recommendation (0.00 - 1.00).</summary>
    public decimal Confidence { get; private set; }

    /// <summary>Structured explanation of the recommendation (JSON string).</summary>
    public string Explanation { get; private set; } = string.Empty;

    /// <summary>Version of the model that produced this result.</summary>
    public string ModelVersion { get; private set; } = string.Empty;

    /// <summary>Whether a nurse overrode the AI recommendation.</summary>
    public bool HumanOverride { get; private set; }

    /// <summary>Nurse's rationale for overriding, if applicable.</summary>
    public string? NurseRationale { get; private set; }

    /// <summary>Timestamp when this result was created.</summary>
    public DateTime CreatedAt { get; private set; }

    /// <summary>Private constructor for EF Core materialization.</summary>
    private TriageResult() { }

    /// <summary>
    /// Creates a new triage result with validated inputs.
    /// </summary>
    /// <param name="sessionId">The parent session ID.</param>
    /// <param name="careLevel">Recommended care setting.</param>
    /// <param name="confidence">Model confidence (0.00 - 1.00).</param>
    /// <param name="explanation">Structured explanation (JSON).</param>
    /// <param name="modelVersion">Version of the model used.</param>
    /// <returns>A Result containing the triage result on success, or an error on failure.</returns>
    public static Result<TriageResult> Create(
        Guid sessionId,
        CareLevel careLevel,
        decimal confidence,
        string explanation,
        string modelVersion)
    {
        if (sessionId == Guid.Empty)
            return Result<TriageResult>.Failure("Session ID is required.");

        if (confidence < 0m || confidence > 1m)
            return Result<TriageResult>.Failure("Confidence must be between 0.00 and 1.00.");

        if (string.IsNullOrWhiteSpace(explanation))
            return Result<TriageResult>.Failure("Explanation is required.");

        if (string.IsNullOrWhiteSpace(modelVersion))
            return Result<TriageResult>.Failure("Model version is required.");

        var result = new TriageResult
        {
            Id = Guid.NewGuid(),
            SessionId = sessionId,
            CareLevel = careLevel,
            Confidence = confidence,
            Explanation = explanation.Trim(),
            ModelVersion = modelVersion.Trim(),
            HumanOverride = false,
            NurseRationale = null,
            CreatedAt = DateTime.UtcNow
        };

        return Result<TriageResult>.Success(result);
    }

    /// <summary>
    /// Records a nurse override of the AI recommendation.
    /// This is part of the human-in-loop mechanism for high-stakes decisions.
    /// </summary>
    /// <param name="newCareLevel">The nurse's recommended care level.</param>
    /// <param name="rationale">Required rationale for the override.</param>
    /// <returns>A Result indicating success or failure.</returns>
    public Result<TriageResult> ApplyNurseOverride(CareLevel newCareLevel, string rationale)
    {
        if (string.IsNullOrWhiteSpace(rationale))
            return Result<TriageResult>.Failure("Nurse rationale is required for overrides.");

        CareLevel = newCareLevel;
        HumanOverride = true;
        NurseRationale = rationale.Trim();

        return Result<TriageResult>.Success(this);
    }
}
