using FluentAssertions;
using MedEquity.Core.Entities;
using Xunit;

namespace MedEquity.Core.Tests.Entities;

public class PatientSessionTests
{
    [Fact]
    public void Create_WithValidInputs_ReturnsSuccess()
    {
        var result = PatientSession.Create("30-40", "Male", "Johannesburg Metro");

        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.AgeRange.Should().Be("30-40");
        result.Value.Sex.Should().Be("Male");
        result.Value.Geography.Should().Be("Johannesburg Metro");
        result.Value.SessionId.Should().NotBeEmpty();
    }

    [Fact]
    public void Create_SetsCreatedAtToUtcNow()
    {
        var before = DateTime.UtcNow;

        var result = PatientSession.Create("20-30", "Female", "eThekwini Metro");

        var after = DateTime.UtcNow;
        result.Value!.CreatedAt.Should().BeOnOrAfter(before).And.BeOnOrBefore(after);
    }

    [Fact]
    public void Create_SetsExpiryToSevenDaysFromNow()
    {
        var before = DateTime.UtcNow;

        var result = PatientSession.Create("40-50", "Other", "Tshwane Metro");

        var expectedExpiry = before.AddDays(7);
        result.Value!.ExpiresAt.Should().BeCloseTo(expectedExpiry, TimeSpan.FromSeconds(5));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Create_WithEmptyAgeRange_ReturnsFailure(string? ageRange)
    {
        var result = PatientSession.Create(ageRange!, "Male", "Johannesburg Metro");

        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("Age range");
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Create_WithEmptySex_ReturnsFailure(string? sex)
    {
        var result = PatientSession.Create("30-40", sex!, "Johannesburg Metro");

        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("Sex");
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Create_WithEmptyGeography_ReturnsFailure(string? geography)
    {
        var result = PatientSession.Create("30-40", "Male", geography!);

        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("Geography");
    }

    [Fact]
    public void Create_TrimsWhitespace()
    {
        var result = PatientSession.Create("  30-40  ", "  Male  ", "  Johannesburg  ");

        result.Value!.AgeRange.Should().Be("30-40");
        result.Value.Sex.Should().Be("Male");
        result.Value.Geography.Should().Be("Johannesburg");
    }

    [Fact]
    public void IsExpired_WhenNotExpired_ReturnsFalse()
    {
        var result = PatientSession.Create("30-40", "Male", "Johannesburg Metro");

        result.Value!.IsExpired().Should().BeFalse();
    }

    [Fact]
    public void Create_GeneratesUniqueSessionIds()
    {
        var result1 = PatientSession.Create("30-40", "Male", "Johannesburg Metro");
        var result2 = PatientSession.Create("30-40", "Male", "Johannesburg Metro");

        result1.Value!.SessionId.Should().NotBe(result2.Value!.SessionId);
    }
}
