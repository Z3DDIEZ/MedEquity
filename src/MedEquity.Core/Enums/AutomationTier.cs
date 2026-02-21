namespace MedEquity.Core.Enums;

/// <summary>
/// Determines the level of human oversight required for a triage decision.
/// Scales with clinical stakes — critical decisions are always human-led.
/// </summary>
public enum AutomationTier
{
    /// <summary>Low stakes, high confidence (e.g. self-care). Shown to patient immediately.</summary>
    FullyAutomated,

    /// <summary>Medium stakes. Shown to patient, nurse notified for audit sample.</summary>
    AutomatedWithAlert,

    /// <summary>High stakes or low confidence. Nurse MUST approve before patient sees result.</summary>
    HumanInLoop,

    /// <summary>Critical stakes (emergency, vulnerable population). AI assists nurse, nurse decides.</summary>
    HumanLed
}
