using FluentAssertions;
using MedEquity.Core.Entities;

namespace MedEquity.Core.Tests.Entities;

public class SymptomTests
{
    private static readonly Guid ValidSessionId = Guid.NewGuid();

    [Fact]
    public void Create_WithValidInputs_ReturnsSuccess()
    {
        var result = Symptom.Create(ValidSessionId, "386661006", 8, 24);

        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.SymptomCode.Should().Be("386661006");
        result.Value.Severity.Should().Be(8);
        result.Value.DurationHours.Should().Be(24);
        result.Value.SessionId.Should().Be(ValidSessionId);
        result.Value.Id.Should().NotBeEmpty();
    }

    [Theory]
    [InlineData(1)]
    [InlineData(5)]
    [InlineData(10)]
    public void Create_WithValidSeverity_ReturnsSuccess(int severity)
    {
        var result = Symptom.Create(ValidSessionId, "49727002", severity, 12);

        result.IsSuccess.Should().BeTrue();
        result.Value!.Severity.Should().Be(severity);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(11)]
    [InlineData(100)]
    public void Create_WithInvalidSeverity_ReturnsFailure(int severity)
    {
        var result = Symptom.Create(ValidSessionId, "49727002", severity, 12);

        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("Severity");
    }

    [Fact]
    public void Create_WithEmptySessionId_ReturnsFailure()
    {
        var result = Symptom.Create(Guid.Empty, "386661006", 5, 12);

        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("Session ID");
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Create_WithEmptySymptomCode_ReturnsFailure(string? symptomCode)
    {
        var result = Symptom.Create(ValidSessionId, symptomCode!, 5, 12);

        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("Symptom code");
    }

    [Fact]
    public void Create_WithNegativeDuration_ReturnsFailure()
    {
        var result = Symptom.Create(ValidSessionId, "386661006", 5, -1);

        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("Duration");
    }

    [Fact]
    public void Create_WithZeroDuration_ReturnsSuccess()
    {
        var result = Symptom.Create(ValidSessionId, "386661006", 5, 0);

        result.IsSuccess.Should().BeTrue();
        result.Value!.DurationHours.Should().Be(0);
    }

    [Fact]
    public void Create_TrimsSymptomCode()
    {
        var result = Symptom.Create(ValidSessionId, "  386661006  ", 5, 12);

        result.Value!.SymptomCode.Should().Be("386661006");
    }
}
