using FluentAssertions;
using MedEquity.Core.Entities;
using MedEquity.Core.Enums;
using Xunit;

namespace MedEquity.Core.Tests.Entities;

public class TriageResultTests
{
    private static readonly Guid ValidSessionId = Guid.NewGuid();

    [Fact]
    public void Create_WithValidInputs_ReturnsSuccess()
    {
        var result = TriageResult.Create(
            ValidSessionId,
            CareLevel.UrgentCare,
            0.85m,
            "{\"primary_concern\": \"respiratory distress\"}",
            "gemini-1.5-flash-v1");

        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.CareLevel.Should().Be(CareLevel.UrgentCare);
        result.Value.Confidence.Should().Be(0.85m);
        result.Value.HumanOverride.Should().BeFalse();
        result.Value.NurseRationale.Should().BeNull();
        result.Value.Id.Should().NotBeEmpty();
    }

    [Theory]
    [InlineData(0.00)]
    [InlineData(0.50)]
    [InlineData(1.00)]
    public void Create_WithValidConfidence_ReturnsSuccess(double confidence)
    {
        var result = TriageResult.Create(
            ValidSessionId,
            CareLevel.PrimaryCare,
            (decimal)confidence,
            "test explanation",
            "v1");

        result.IsSuccess.Should().BeTrue();
    }

    [Theory]
    [InlineData(-0.01)]
    [InlineData(1.01)]
    [InlineData(2.00)]
    [InlineData(-1.00)]
    public void Create_WithInvalidConfidence_ReturnsFailure(double confidence)
    {
        var result = TriageResult.Create(
            ValidSessionId,
            CareLevel.Emergency,
            (decimal)confidence,
            "test explanation",
            "v1");

        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("Confidence");
    }

    [Fact]
    public void Create_WithEmptySessionId_ReturnsFailure()
    {
        var result = TriageResult.Create(
            Guid.Empty,
            CareLevel.Emergency,
            0.9m,
            "test explanation",
            "v1");

        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("Session ID");
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Create_WithEmptyExplanation_ReturnsFailure(string? explanation)
    {
        var result = TriageResult.Create(
            ValidSessionId,
            CareLevel.PrimaryCare,
            0.8m,
            explanation!,
            "v1");

        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("Explanation");
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Create_WithEmptyModelVersion_ReturnsFailure(string? modelVersion)
    {
        var result = TriageResult.Create(
            ValidSessionId,
            CareLevel.SelfCare,
            0.95m,
            "test explanation",
            modelVersion!);

        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("Model version");
    }

    [Fact]
    public void Create_SetsTimestamp()
    {
        var before = DateTime.UtcNow;

        var result = TriageResult.Create(
            ValidSessionId, CareLevel.Telemedicine, 0.7m, "explanation", "v1");

        var after = DateTime.UtcNow;
        result.Value!.CreatedAt.Should().BeOnOrAfter(before).And.BeOnOrBefore(after);
    }

    [Fact]
    public void ApplyNurseOverride_WithValidRationale_UpdatesFields()
    {
        var triageResult = TriageResult.Create(
            ValidSessionId, CareLevel.PrimaryCare, 0.6m, "low confidence", "v1");

        var overrideResult = triageResult.Value!.ApplyNurseOverride(
            CareLevel.UrgentCare,
            "Patient presents with additional concerning signs not captured");

        overrideResult.IsSuccess.Should().BeTrue();
        triageResult.Value.HumanOverride.Should().BeTrue();
        triageResult.Value.CareLevel.Should().Be(CareLevel.UrgentCare);
        triageResult.Value.NurseRationale.Should().Contain("additional concerning signs");
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void ApplyNurseOverride_WithEmptyRationale_ReturnsFailure(string? rationale)
    {
        var triageResult = TriageResult.Create(
            ValidSessionId, CareLevel.SelfCare, 0.9m, "minor symptoms", "v1");

        var overrideResult = triageResult.Value!.ApplyNurseOverride(
            CareLevel.Emergency,
            rationale!);

        overrideResult.IsSuccess.Should().BeFalse();
        overrideResult.Error.Should().Contain("rationale");
    }

    [Fact]
    public void Create_AllCareLevelsAccepted()
    {
        foreach (var careLevel in Enum.GetValues<CareLevel>())
        {
            var result = TriageResult.Create(
                ValidSessionId, careLevel, 0.8m, "explanation", "v1");

            result.IsSuccess.Should().BeTrue($"CareLevel.{careLevel} should be valid");
        }
    }
}
