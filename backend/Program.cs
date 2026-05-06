using CinemaAPI.Data;
using CinemaAPI.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using Amazon.S3;

var builder = WebApplication.CreateBuilder(args);

//  НАСТРОЙКА БАЗЫ ДАННЫХ 
builder.Services.AddDbContext<CinemaDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        npgsqlOptions => npgsqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(10),
            errorCodesToAdd: null
        )
    )
);

// РЕГИСТРАЦИЯ СОБСТВЕННЫХ СЕРВИСОВ
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IMovieService, MovieService>();
builder.Services.AddScoped<IFavoriteService, FavoriteService>();
builder.Services.AddScoped<IHistoryService, HistoryService>();
builder.Services.AddScoped<IDictionaryService, DictionaryService>();
builder.Services.AddScoped<IAdminService, AdminService>();

// РАЗРЕШЕНИЕ ЗАГРУЗКИ БОЛЬШИХ ФАЙЛОВ =====================
builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 10L * 1024 * 1024 * 1024; // до 10 ГБ
});

builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.Limits.MaxRequestBodySize = 10L * 1024 * 1024 * 1024;
});

builder.Services.Configure<IISServerOptions>(options =>
{
    options.MaxRequestBodySize = 10L * 1024 * 1024 * 1024;
});

//  ИНИЦИАЛИЗАЦИЯ S3 ХРАНИЛИЩА
builder.Services.AddSingleton<IAmazonS3>(sp =>
{
    var config = new AmazonS3Config
    {
        ServiceURL = "https://storage.yandexcloud.net",
        ForcePathStyle = true
    };
    return new AmazonS3Client("YCAJE2ERc1h2bAZ5cBTQoVC6p", "YCMimJeK8mpB2ilz0WGFTzc1d0Yevpqs9K4m7TMS", config);
});

//  JWT АУТЕНТИФИКАЦИЯ С HTTPONLY COOKIE 
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
            ValidAudience = builder.Configuration["JwtSettings:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:Secret"]!))
        };

        // Извлечение JWT из httpOnly cookie
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                // Сначала  взять токен из cookie token
                var token = context.Request.Cookies["token"];

                if (string.IsNullOrEmpty(token))
                {
                    // Если в cookie нет - заголовок Authorization
                    var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
                    if (authHeader?.StartsWith("Bearer ") == true)
                    {
                        token = authHeader["Bearer ".Length..];
                    }
                }

                if (!string.IsNullOrEmpty(token))
                {
                    context.Token = token;
                }

                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Предотвращение циклических ссылок при сериализации
        options.JsonSerializerOptions.ReferenceHandler =
            System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddEndpointsApiExplorer();

//  SWAGGER 
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Cinema API",
        Version = "v0.1"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Введите JWT токен (если не используете httpOnly cookie)"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

//  CORS 
// Добавлены и локальный, и продакшен-домен навсякий
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000",                                    // локальная разработка
                "https://d5dim1pbg3eh6th4ogh6.sax5b7yq.apigw.yandexcloud.net" // продакшен
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials()                    // для передачи httpOnly cookie
            .WithExposedHeaders("Content-Disposition");
    });
});

var app = builder.Build();

//  ДИАГНОСТИКА ПОДКЛЮЧЕНИЯ К БД ПРИ СТАРТЕ 
Console.WriteLine("=== Проверка подключения к базе данных ===");
try
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<CinemaDbContext>();
    var canConnect = await db.Database.CanConnectAsync();
    Console.WriteLine(canConnect
        ? "✓ Успешное подключение к PostgreSQL"
        : "✗ Не удалось подключиться к PostgreSQL");
}
catch (Exception ex)
{
    Console.WriteLine($"✗ Ошибка подключения к БД: {ex.Message}");
}
Console.WriteLine("ААААААААААААААААААААААААААААААААААА");

//  CORS ГЛОБАЛЬНО 
app.UseCors("AllowFrontend");

//  НАСТРОЙКА РАЗДАЧИ СТАТИЧЕСКИХ ФАЙЛОВ (ВИДЕО, ПОСТЕРЫ, СУБТИТРЫ) 
var provider = new FileExtensionContentTypeProvider();
provider.Mappings[".vtt"] = "text/vtt";   // WebVTT субтитры
provider.Mappings[".mp4"] = "video/mp4";  // видео

var cinemaStoragePath = Path.Combine(Directory.GetCurrentDirectory(), "cinema-storage");
var fullPath = Path.GetFullPath(cinemaStoragePath);

Console.WriteLine($"Looking for cinema-storage at: {fullPath}");
Console.WriteLine($"Directory exists: {Directory.Exists(fullPath)}");

if (Directory.Exists(fullPath))
{
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(fullPath),
        RequestPath = "/cinema-storage",
        ContentTypeProvider = provider,
        OnPrepareResponse = ctx =>
        {
            // Поддержка CORS (для доступа с фронтенда на другом порту)
            var origin = ctx.Context.Request.Headers["Origin"].FirstOrDefault();
            if (!string.IsNullOrEmpty(origin) && origin == "http://localhost:3000")
            {
                ctx.Context.Response.Headers.Append("Access-Control-Allow-Origin", origin);
                ctx.Context.Response.Headers.Append("Access-Control-Allow-Credentials", "true");
            }

            // Кэширование на сутки (уменьшает нагрузку)
            ctx.Context.Response.Headers.Append("Cache-Control", "public, max-age=86400");

            //  только GET (для видео не нужны другие методы)
            ctx.Context.Response.Headers.Append("Access-Control-Allow-Methods", "GET");

            // нужные заголовки (например Range для частичной загрузки)
            ctx.Context.Response.Headers.Append("Access-Control-Allow-Headers",
                "Range, Content-Range, Accept, Content-Type, Origin");
        }
    });
    Console.WriteLine("Static files configured successfully!");
}
else
{
    Console.WriteLine("WARNING: cinema-storage not found!");
}

//  SWAGGER UI И ДОБАВЛЕНИЕ СЕКЦИИ SERVERS 
if (app.Environment.IsDevelopment())
{
    app.UseSwagger(c =>
    {
        c.PreSerializeFilters.Add((swaggerDoc, httpReq) =>
        {
            swaggerDoc.Servers = new List<OpenApiServer>
            {
                new OpenApiServer { Url = $"{httpReq.Scheme}://{httpReq.Host.Value}" }
            };
        });
    });

    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Cinema API v1");
    });

    // Диагностические эндпоинты
    app.MapGet("/debug/paths", () =>
    {
        var currentDir = Directory.GetCurrentDirectory();
        var cinemaPath = Path.GetFullPath(Path.Combine(currentDir, "..", "cinema-storage"));
        return Results.Ok(new
        {
            CurrentDirectory = currentDir,
            CinemaStoragePath = cinemaPath,
            Exists = Directory.Exists(cinemaPath),
            PostersExist = Directory.Exists(Path.Combine(cinemaPath, "posters")),
            Files = Directory.Exists(cinemaPath)
                ? Directory.GetFiles(cinemaPath, "*", SearchOption.AllDirectories).Take(10)
                : Array.Empty<string>()
        });
    });
}

//  ГЛОБАЛЬНЫЙ ОБРАБОТЧИК НЕОБРАБОТАННЫХ ИСКЛЮЧЕНИЙ 
app.Use(async (context, next) =>
{
    try
    {
        await next();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[!!!] UNHANDLED EXCEPTION: {ex}");

        context.Response.StatusCode = 500;
        context.Response.ContentType = "text/plain";
        await context.Response.WriteAsync(ex.ToString());
    }
});

//  АУТЕНТИФИКАЦИЯ / АВТОРИЗАЦИЯ И МАРШРУТЫ 
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();