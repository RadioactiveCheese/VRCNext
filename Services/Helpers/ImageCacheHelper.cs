using System.Collections.Concurrent;

namespace VRCNext.Services.Helpers;

// Unified image cache. One entity ID → one file → reused everywhere.
// Directory: %AppData%\VRCNext\Caches\ImageCache\{subdir}\{entityId}.{ext}
public static class ImageCacheHelper
{
    private static string _baseDir = "";
    private static HttpClient? _http;

    public static int  Port            { get; set; } = 49152;
    public static int  LimitGb         { get; set; } = 5;
    public static bool OptimizeEnabled { get; set; } = true;

    /// <summary>Set at startup to route download logs to the activity log.</summary>
    public static Action<string>? Log { get; set; }
    private static readonly ConcurrentDictionary<string, Task<string?>> _downloads = new();

    // permafail persists across sessions, 30-day TTL
    private static readonly string _permafailPath = Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
        "VRCNext", "Caches", "Permafail", "permafail.json");
    private static readonly Dictionary<string, DateTime> _permafail = [];
    private static readonly Lock _permafailLock = new();
    private static readonly TimeSpan PermafailTtl = TimeSpan.FromDays(30);

    private static void LoadPermafail()
    {
        if (string.IsNullOrEmpty(_permafailPath) || !File.Exists(_permafailPath)) return;
        try
        {
            var json = File.ReadAllText(_permafailPath);
            var obj  = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, string>>(json);
            if (obj == null) return;
            var cutoff = DateTime.UtcNow - PermafailTtl;
            lock (_permafailLock)
                foreach (var kv in obj)
                    if (DateTime.TryParse(kv.Value, out var dt) && dt > cutoff)
                        _permafail[kv.Key] = dt;
        }
        catch { }
    }

    private static void SavePermafail()
    {
        if (string.IsNullOrEmpty(_permafailPath)) return;
        try
        {
            Dictionary<string, string> copy;
            lock (_permafailLock) copy = _permafail.ToDictionary(k => k.Key, k => k.Value.ToString("o"));
            File.WriteAllText(_permafailPath, System.Text.Json.JsonSerializer.Serialize(copy));
        }
        catch { }
    }

    private static bool IsPermafailed(string url)
    {
        lock (_permafailLock)
        {
            if (!_permafail.TryGetValue(url, out var dt)) return false;
            if (DateTime.UtcNow - dt > PermafailTtl) { _permafail.Remove(url); return false; }
            return true;
        }
    }

    private static void AddPermafail(string url)
    {
        lock (_permafailLock) _permafail[url] = DateTime.UtcNow;
        _ = Task.Run(SavePermafail);
    }

    private static readonly string[] _imageExtensions = [".jpg", ".png", ".webp", ".gif"];

    public static void Initialize(HttpClient http)
    {
        _baseDir = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
            "VRCNext", "Caches", "ImageCache");
        _http = http;

        Directory.CreateDirectory(Path.GetDirectoryName(_permafailPath)!);
        LoadPermafail();

        Directory.CreateDirectory(Path.Combine(_baseDir, "Worlds"));
        Directory.CreateDirectory(Path.Combine(_baseDir, "Groups"));
        Directory.CreateDirectory(Path.Combine(_baseDir, "Avatars"));
        Directory.CreateDirectory(Path.Combine(_baseDir, "Users"));
        Directory.CreateDirectory(Path.Combine(_baseDir, "Badges"));
    }

    public static string GetWorldUrl(string? worldId, string? imageUrl)
    {
        var cached = GetWorldCached(worldId);
        if (cached != null) return ToLocalUrl(cached);
        imageUrl = StripLocalhostUrl(imageUrl);
        CacheWorldBackground(worldId, imageUrl);
        return NormalizeTo512(imageUrl ?? "");
    }

    public static string ToLocalUrl(string localPath)
    {
        var rel = Path.GetRelativePath(_baseDir, localPath).Replace('\\', '/');
        return $"http://localhost:{Port}/imgcache/{rel}";
    }

// World
    public static string? GetWorldCached(string? worldId)
        => FindCachedFile("Worlds", worldId);
    public static Task<string?> CacheWorldAsync(string? worldId, string? imageUrl, bool forceRefresh = false)
        => CacheAsync("Worlds", worldId, imageUrl, forceRefresh);
    public static string? CacheWorldBackground(string? worldId, string? imageUrl)
    {
        var cached = GetWorldCached(worldId);
        if (cached != null) return cached;
        if (!string.IsNullOrWhiteSpace(worldId) && !string.IsNullOrWhiteSpace(imageUrl))
            _ = CacheWorldAsync(worldId, imageUrl);
        return null;
    }

// Groups

    public static string? GetGroupCached(string? groupId)
        => FindCachedFile("Groups", groupId);

    public static Task<string?> CacheGroupAsync(string? groupId, string? iconUrl, bool forceRefresh = false)
        => CacheAsync("Groups", groupId, iconUrl, forceRefresh);

    public static string? CacheGroupBackground(string? groupId, string? iconUrl)
    {
        var cached = GetGroupCached(groupId);
        if (cached != null) return cached;
        if (!string.IsNullOrWhiteSpace(groupId) && !string.IsNullOrWhiteSpace(iconUrl))
            _ = CacheGroupAsync(groupId, iconUrl);
        return null;
    }

    public static string GetGroupUrl(string? groupId, string? iconUrl)
    {
        var cached = GetGroupCached(groupId);
        if (cached != null) return ToLocalUrl(cached);
        iconUrl = StripLocalhostUrl(iconUrl);
        CacheGroupBackground(groupId, iconUrl);
        return NormalizeTo512(iconUrl ?? "");
    }

    public static string GetGroupBannerUrl(string? groupId, string? bannerUrl)
    {
        var bannerId = string.IsNullOrWhiteSpace(groupId) ? null : groupId + "_banner";
        var cached   = FindCachedFile("Groups", bannerId);
        if (cached != null) return ToLocalUrl(cached);
        bannerUrl = StripLocalhostUrl(bannerUrl);
        if (!string.IsNullOrWhiteSpace(bannerId) && !string.IsNullOrWhiteSpace(bannerUrl))
            _ = CacheAsync("Groups", bannerId, bannerUrl, false);
        return NormalizeTo512(bannerUrl ?? "");
    }
// Users

    public static string? GetUserCached(string? userId)
        => FindCachedFile("Users", userId);

    public static string? GetUserBannerCached(string? userId)
        => FindCachedFile("Users", userId == null ? null : userId + "_banner");

    public static Task<string?> CacheUserAsync(string? userId, string? iconUrl, bool forceRefresh = false)
        => CacheAsync("Users", userId, iconUrl, forceRefresh);

    public static string GetUserUrl(string? userId, string? iconUrl)
    {
        var cached = GetUserCached(userId);
        if (cached != null) return ToLocalUrl(cached);
        iconUrl = StripLocalhostUrl(iconUrl);
        if (!string.IsNullOrWhiteSpace(userId) && !string.IsNullOrWhiteSpace(iconUrl))
            _ = CacheAsync("Users", userId, iconUrl, false);
        return NormalizeTo512(iconUrl ?? "");
    }

    public static string GetUserBannerUrl(string? userId, string? bannerUrl)
    {
        var bannerId = userId == null ? null : userId + "_banner";
        var cached = GetUserBannerCached(userId);
        if (cached != null) return ToLocalUrl(cached);
        bannerUrl = StripLocalhostUrl(bannerUrl);
        if (!string.IsNullOrWhiteSpace(bannerId) && !string.IsNullOrWhiteSpace(bannerUrl))
            _ = CacheAsync("Users", bannerId, bannerUrl, false);
        return NormalizeTo512(bannerUrl ?? "");
    }
// Badges

    public static string GetBadgeUrl(string? badgeId, string? imageUrl)
    {
        var cached = FindCachedFile("Badges", badgeId);
        if (cached != null) return ToLocalUrl(cached);
        imageUrl = StripLocalhostUrl(imageUrl);
        if (!string.IsNullOrWhiteSpace(badgeId) && !string.IsNullOrWhiteSpace(imageUrl))
            _ = CacheAsync("Badges", badgeId, imageUrl, false);
        return NormalizeTo512(imageUrl ?? "");
    }

// Avatars

    public static string? GetAvatarCached(string? avatarId)
        => FindCachedFile("Avatars", avatarId);

    public static Task<string?> CacheAvatarAsync(string? avatarId, string? imageUrl, bool forceRefresh = false)
        => CacheAsync("Avatars", avatarId, imageUrl, forceRefresh);

    public static string? CacheAvatarBackground(string? avatarId, string? imageUrl)
    {
        var cached = GetAvatarCached(avatarId);
        if (cached != null) return cached;
        if (!string.IsNullOrWhiteSpace(avatarId) && !string.IsNullOrWhiteSpace(imageUrl))
            _ = CacheAvatarAsync(avatarId, imageUrl);
        return null;
    }

    public static string GetAvatarUrl(string? avatarId, string? imageUrl)
    {
        var cached = GetAvatarCached(avatarId);
        if (cached != null) return ToLocalUrl(cached);
        imageUrl = StripLocalhostUrl(imageUrl);
        CacheAvatarBackground(avatarId, imageUrl);
        return NormalizeTo512(imageUrl ?? "");
    }
// Core

    // Strip stale localhost URLs — file was deleted but FFC still has old localhost URL.
    // We can't re-download from localhost, and we've lost the original VRChat URL.
    private static string? StripLocalhostUrl(string? url) =>
        url != null && url.StartsWith("http://localhost:") ? null : url;

    private static Task<string?> CacheAsync(string subdir, string? entityId, string? imageUrl, bool forceRefresh)
    {
        imageUrl = StripLocalhostUrl(imageUrl); // Never try to download from localhost
        if (string.IsNullOrWhiteSpace(entityId) || string.IsNullOrWhiteSpace(imageUrl) || _http == null)
            return Task.FromResult<string?>(null);
        if (IsPermafailed(NormalizeTo512(imageUrl)))
            return Task.FromResult<string?>(null);

        if (!forceRefresh)
        {
            var existing = FindCachedFile(subdir, entityId);
            if (existing != null) return Task.FromResult<string?>(existing);
        }

        var key = $"{subdir}/{entityId}";
        return _downloads.GetOrAdd(key, _ =>
        {
            var task = DownloadAsync(subdir, entityId, imageUrl, forceRefresh);
            // Remove from in-flight map when done, regardless of outcome
            return task.ContinueWith(t =>
            {
                _downloads.TryRemove(key, out Task<string?>? _);
                return t.Status == TaskStatus.RanToCompletion ? t.Result : null;
            }, TaskContinuationOptions.ExecuteSynchronously);
        });
    }

    private static async Task<string?> DownloadAsync(string subdir, string entityId, string imageUrl, bool forceRefresh)
    {
        var dir      = Path.Combine(_baseDir, subdir);
        var tmpPath  = Path.Combine(dir, entityId + ".tmp");
        var fetchUrl = NormalizeTo512(imageUrl);

        Log?.Invoke($"[IMG] GET {subdir}/{entityId} → {fetchUrl}");

        try
        {
            using var resp = await _http!.GetAsync(fetchUrl, HttpCompletionOption.ResponseHeadersRead);
            if (!resp.IsSuccessStatusCode)
            {
                var code = (int)resp.StatusCode;
                Log?.Invoke($"[IMG] FAIL {subdir}/{entityId} → {code}");
                if (code == 403 || code == 404) AddPermafail(fetchUrl);
                return null;
            }

            using (var stream = await resp.Content.ReadAsStreamAsync())
            using (var fs    = File.Create(tmpPath))
                await stream.CopyToAsync(fs);
        }
        catch (Exception ex)
        {
            Log?.Invoke($"[IMG] ERR {subdir}/{entityId} → {ex.Message}");
            TryDelete(tmpPath);
            return null;
        }

        var ext = DetectExtension(tmpPath);
        if (ext == null)
        {
            Log?.Invoke($"[IMG] SKIP {subdir}/{entityId} → not an image");
            TryDelete(tmpPath);
            return null;
        }

        if (forceRefresh)
            foreach (var old in _imageExtensions)
                TryDelete(Path.Combine(dir, entityId + old));

        var finalPath = Path.Combine(dir, entityId + ext);
        try
        {
            File.Move(tmpPath, finalPath, overwrite: true);
        }
        catch
        {
            TryDelete(tmpPath);
            return null;
        }

        Log?.Invoke($"[IMG] OK {subdir}/{entityId}{ext}");
        _ = Task.Run(TrimIfNeeded);
        return finalPath;
    }
// Helpers
    private static string? FindCachedFile(string subdir, string? entityId)
    {
        if (string.IsNullOrWhiteSpace(entityId)) return null;
        var dir = Path.Combine(_baseDir, subdir);
        foreach (var ext in _imageExtensions)
        {
            var path = Path.Combine(dir, entityId + ext);
            if (File.Exists(path)) return path;
        }
        return null;
    }

    private static string? DetectExtension(string path)
    {
        try
        {
            Span<byte> hdr = stackalloc byte[12];
            using var f = File.OpenRead(path);
            f.ReadAtLeast(hdr, hdr.Length, throwOnEndOfStream: false);

            if (hdr[0] == 0xFF && hdr[1] == 0xD8 && hdr[2] == 0xFF)
                return ".jpg";
            if (hdr[0] == 0x89 && hdr[1] == 0x50 && hdr[2] == 0x4E && hdr[3] == 0x47)
                return ".png";
            if (hdr[0] == 0x52 && hdr[1] == 0x49 && hdr[2] == 0x46 && hdr[3] == 0x46 &&
                hdr[8] == 0x57 && hdr[9] == 0x45 && hdr[10] == 0x42 && hdr[11] == 0x50)
                return ".webp";
            if (hdr[0] == 0x47 && hdr[1] == 0x49 && hdr[2] == 0x46)
                return ".gif";
        }
        catch { }
        return null;
    }

    // Cache Manager

    public static long GetCacheSizeBytes()
    {
        if (!Directory.Exists(_baseDir)) return 0;
        return new DirectoryInfo(_baseDir)
            .GetFiles("*", SearchOption.AllDirectories)
            .Where(f => !f.Name.EndsWith(".tmp"))
            .Sum(f => f.Length);
    }

    public static void TrimIfNeeded()
    {
        var limitBytes = (long)LimitGb * 1024 * 1024 * 1024;
        if (limitBytes <= 0 || !Directory.Exists(_baseDir)) return;
        try
        {
            var files = new DirectoryInfo(_baseDir)
                .GetFiles("*", SearchOption.AllDirectories)
                .Where(f => !f.Name.EndsWith(".tmp"))
                .OrderBy(f => f.LastWriteTimeUtc)
                .ToList();
            var total = files.Sum(f => f.Length);
            if (total <= limitBytes) return;
            var target = (long)(limitBytes * 0.8);
            foreach (var f in files)
            {
                if (total <= target) break;
                try { total -= f.Length; f.Delete(); } catch { }
            }
        }
        catch { }
    }

    public static async Task OptimizeAsync(Action<int, int>? onProgress = null)
    {
        if (!Directory.Exists(_baseDir)) return;
        const long threshold = (long)(1.5 * 1024 * 1024);
        var pngFiles = new DirectoryInfo(_baseDir)
            .GetFiles("*.png", SearchOption.AllDirectories)
            .Where(f => f.Length > threshold)
            .Select(f => f.FullName)
            .ToList();
        int total = pngFiles.Count, done = 0;
        onProgress?.Invoke(done, total);
        foreach (var pngPath in pngFiles)
        {
            var jpgPath = pngPath[..^4] + ".jpg";
            try
            {
                using var bmp = SkiaSharp.SKBitmap.Decode(pngPath);
                if (bmp == null) continue;
                using var img  = SkiaSharp.SKImage.FromBitmap(bmp);
                using var data = img.Encode(SkiaSharp.SKEncodedImageFormat.Jpeg, 80);
                if (data != null)
                {
                    using var fs = File.Create(jpgPath);
                    data.SaveTo(fs);
                    try { File.Delete(pngPath); } catch { }
                }
            }
            catch { }
            done++;
            onProgress?.Invoke(done, total);
            await Task.Yield();
        }
    }

    // Converts VRC Url to CDN 512 Endpoints
    public static string NormalizeTo512(string url)
    {
        // /api/1/file/file_xxx/{version}/file try and getting /api/1/image/file_xxx/{version}/512
        const string filePrefix = "/api/1/file/";
        var fi = url.IndexOf(filePrefix, StringComparison.Ordinal);
        if (fi >= 0)
        {
            var rest  = url[(fi + filePrefix.Length)..]; // "file_xxx/{version}/file" should work
            var parts = rest.Split('/');
            if (parts.Length >= 3 && parts[0].StartsWith("file_", StringComparison.OrdinalIgnoreCase))
                return $"https://api.vrchat.cloud/api/1/image/{parts[0]}/{parts[1]}/512";
        }
        // /api/1/image/.../256 the normalize if needed /512 - very hacky way lol
        if (url.Contains("/api/1/image/", StringComparison.Ordinal) && url.EndsWith("/256", StringComparison.Ordinal))
            return url[..^3] + "512";
        return url;
    }

    private static void TryDelete(string path)
    {
        try { if (File.Exists(path)) File.Delete(path); } catch { }
    }
}
