FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj files and restore
COPY ["src/MedEquity.Api/MedEquity.Api.csproj", "src/MedEquity.Api/"]
COPY ["src/MedEquity.Core/MedEquity.Core.csproj", "src/MedEquity.Core/"]
COPY ["src/MedEquity.Governance/MedEquity.Governance.csproj", "src/MedEquity.Governance/"]
RUN dotnet restore "src/MedEquity.Api/MedEquity.Api.csproj"

# Copy everything else
COPY . .

# Build
WORKDIR "/src/src/MedEquity.Api"
RUN dotnet build "MedEquity.Api.csproj" -c Release -o /app/build

# Publish
FROM build AS publish
RUN dotnet publish "MedEquity.Api.csproj" -c Release -o /app/publish

# Final stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
EXPOSE 5000
EXPOSE 5001
ENTRYPOINT ["dotnet", "MedEquity.Api.dll"]
