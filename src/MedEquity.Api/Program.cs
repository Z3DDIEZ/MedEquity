using Medequity.Triage;
using Grpc.Net.Client;
using MedEquity.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddOpenApi();

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

// app.UseHttpsRedirection(); // Disable HTTPS for internal Docker dev

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
                new SymptomEntry { SymptomCode = "386661006", Severity = 7, DurationHours = 48 },
                new SymptomEntry { SymptomCode = "49727002", Severity = 5, DurationHours = 24 }
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
