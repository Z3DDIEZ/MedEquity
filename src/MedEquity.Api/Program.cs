using Medequity.Triage;
using Grpc.Net.Client;
using Microsoft.Extensions.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddOpenApi();

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
            Sex = "Test",
            SymptomCodes = { "TEST_CODE" }
        };
        var reply = await client.AnalyzeSymptomsAsync(request);
        return Results.Ok(new { Status = "Connected", Reply = reply });
    }
    catch (Exception ex)
    {
        return Results.Problem($"gRPC Connection Failed: {ex.Message}");
    }
})
.WithName("TestLink");

app.Run();
