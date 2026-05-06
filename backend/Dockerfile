# Dev-версия с watch
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS development
WORKDIR /src
COPY *.csproj ./
RUN dotnet restore
COPY . ./
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Development
CMD ["dotnet", "watch", "run", "--urls", "http://+:8080"]

# Production-версия
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY *.csproj ./
RUN dotnet restore
COPY . ./
RUN dotnet publish -c Release -o /app/publish --no-restore


FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "CinemaAPI.dll"]