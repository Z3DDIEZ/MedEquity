namespace MedEquity.Core.Common;

/// <summary>
/// Represents the outcome of a domain operation. Use instead of throwing exceptions
/// for expected failure conditions (validation errors, business rule violations).
/// </summary>
/// <typeparam name="T">The type of the value on success.</typeparam>
public sealed class Result<T>
{
    public bool IsSuccess { get; }
    public T? Value { get; }
    public string? Error { get; }

    private Result(T value)
    {
        IsSuccess = true;
        Value = value;
        Error = null;
    }

    private Result(string error)
    {
        IsSuccess = false;
        Value = default;
        Error = error;
    }

    /// <summary>Create a successful result with a value.</summary>
    public static Result<T> Success(T value) => new(value);

    /// <summary>Create a failed result with an error message.</summary>
    public static Result<T> Failure(string error) => new(error);
}
