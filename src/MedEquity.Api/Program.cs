using Medequity.Triage;
using MedEquity.Core.Entities;
using MedEquity.Core.Enums;
using MedEquity.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddOpenApi();

// CORS for React dev server
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// Register EF Core DbContext with PostgreSQL
builder.Services.AddDbContext<MedEquityDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register gRPC Client
builder.Services.AddGrpcClient<TriageService.TriageServiceClient>(o =>
{
    o.Address = new Uri("http://ml_service:8000");
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors();

// ====== POST /api/triage/analyze ======

app.MapPost("/api/triage/analyze", async (
    TriageRequestDto dto,
    TriageService.TriageServiceClient grpcClient,
    MedEquityDbContext db) =>
{
    try
    {
        // 1. Create patient session
        var sessionResult = PatientSession.Create(dto.AgeRange, dto.Sex, dto.Geography);
        if (!sessionResult.IsSuccess)
            return Results.BadRequest(new { Error = sessionResult.Error });

        var session = sessionResult.Value!;

        // 2. Validate and create symptoms
        var symptoms = new List<Symptom>();
        foreach (var s in dto.Symptoms)
        {
            var symptomResult = MedEquity.Core.Entities.Symptom.Create(
                session.SessionId, s.SymptomCode, s.Severity, s.DurationHours);
            if (!symptomResult.IsSuccess)
                return Results.BadRequest(new { Error = symptomResult.Error });
            symptoms.Add(symptomResult.Value!);
        }

        // 3. Call Gemini via gRPC
        var grpcRequest = new SymptomRequest
        {
            AgeRange = dto.AgeRange,
            Sex = dto.Sex,
            Geography = dto.Geography,
        };
        foreach (var s in dto.Symptoms)
        {
            grpcRequest.Symptoms.Add(new Medequity.Triage.SymptomEntry
            {
                SymptomCode = s.SymptomCode,
                Severity = s.Severity,
                DurationHours = s.DurationHours,
            });
        }

        var grpcReply = await grpcClient.AnalyzeSymptomsAsync(grpcRequest);

        // 4. Map care_level string to enum
        var careLevelMap = new Dictionary<string, CareLevel>(StringComparer.OrdinalIgnoreCase)
        {
            ["emergency"] = CareLevel.Emergency,
            ["urgent_care"] = CareLevel.UrgentCare,
            ["primary_care"] = CareLevel.PrimaryCare,
            ["telemedicine"] = CareLevel.Telemedicine,
            ["self_care"] = CareLevel.SelfCare,
        };

        var careLevel = careLevelMap.GetValueOrDefault(grpcReply.CareLevel, CareLevel.PrimaryCare);

        // 5. Create triage result entity
        var triageResult = MedEquity.Core.Entities.TriageResult.Create(
            session.SessionId,
            careLevel,
            (decimal)grpcReply.Confidence,
            grpcReply.Reasoning,
            grpcReply.ModelVersion);

        if (!triageResult.IsSuccess)
            return Results.Problem(triageResult.Error);

        // 6. Persist to database
        db.PatientSessions.Add(session);
        foreach (var symptom in symptoms)
            db.Symptoms.Add(symptom);
        db.TriageResults.Add(triageResult.Value!);
        await db.SaveChangesAsync();

        // 7. Return structured response
        return Results.Ok(new
        {
            Status = "Success",
            SessionId = session.SessionId,
            CareLevel = grpcReply.CareLevel,
            Confidence = grpcReply.Confidence,
            PrimaryConcern = grpcReply.PrimaryConcern,
            Reasoning = grpcReply.Reasoning,
            RedFlags = grpcReply.RedFlags.ToList(),
            NextSteps = grpcReply.NextSteps.ToList(),
            ModelVersion = grpcReply.ModelVersion,
        });
    }
    catch (Exception ex)
    {
        return Results.Problem(
            detail: $"{ex.GetType().Name}: {ex.Message}\n{ex.InnerException?.Message}",
            title: "Triage Analysis Failed",
            statusCode: 500);
    }
})
.WithName("AnalyzeSymptoms");

// ====== GET /test-link (legacy health check) ======

app.MapGet("/test-link", async (TriageService.TriageServiceClient client) =>
{
    try
    {
        var request = new SymptomRequest
        {
            AgeRange = "30-40",
            Sex = "Male",
            Geography = "Johannesburg Metro",
            Symptoms =
            {
                new Medequity.Triage.SymptomEntry { SymptomCode = "386661006", Severity = 7, DurationHours = 48 },
                new Medequity.Triage.SymptomEntry { SymptomCode = "49727002", Severity = 5, DurationHours = 24 }
            }
        };
        var reply = await client.AnalyzeSymptomsAsync(request);
        return Results.Ok(new
        {
            Status = "Connected",
            CareLevel = reply.CareLevel,
            Confidence = reply.Confidence,
            PrimaryConcern = reply.PrimaryConcern,
            Reasoning = reply.Reasoning,
            RedFlags = reply.RedFlags.ToList(),
            NextSteps = reply.NextSteps.ToList(),
            ModelVersion = reply.ModelVersion
        });
    }
    catch (Exception ex)
    {
        return Results.Problem($"gRPC Connection Failed: {ex.Message}");
    }
})
.WithName("TestLink");

app.Run();

// ====== DTOs (must be after top-level statements in C#) ======

record SymptomDto(string SymptomCode, int Severity, int DurationHours);
record TriageRequestDto(string AgeRange, string Sex, string Geography, List<SymptomDto> Symptoms);
