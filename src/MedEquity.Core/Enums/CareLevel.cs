namespace MedEquity.Core.Enums;

/// <summary>
/// Recommended care setting based on symptom triage.
/// System ONLY navigates to care levels — never diagnoses conditions.
/// </summary>
public enum CareLevel
{
    /// <summary>Life-threatening, immediate ER needed.</summary>
    Emergency,

    /// <summary>Serious but not life-threatening, urgent care within 4 hours.</summary>
    UrgentCare,

    /// <summary>Non-urgent, schedule appointment within 1-3 days.</summary>
    PrimaryCare,

    /// <summary>Suitable for virtual consultation.</summary>
    Telemedicine,

    /// <summary>Minor symptoms, monitor at home.</summary>
    SelfCare
}
