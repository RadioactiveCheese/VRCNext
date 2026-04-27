using System.Collections.Concurrent;

namespace VRCNext.Services.Helpers;

// Unified image cache. One entity ID → one file → reused everywhere.
// Directory: %AppData%\VRCNext\Caches\ImageCache\{subdir}\{entityId}.{ext}
public static class ImageCacheHelper
{
    private static string _baseDir = "";
    private static HttpClient? _http;

    public static int Port { get; set; } = 49152;
    private static readonly ConcurrentDictionary<string, Task<string?>> _downloads = new();

    private static readonly string[] _imageExtensions = [".jpg", ".png", ".webp", ".gif"];

    public static void Initialize(HttpClient http)
    {
        _baseDir = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
            "VRCNext", "Caches", "ImageCache");
        _http = http;

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
        CacheWorldBackground(worldId, imageUrl);
        return imageUrl ?? "";
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
        CacheGroupBackground(groupId, iconUrl);
        return iconUrl ?? "";
    }

    public static string GetGroupBannerUrl(string? groupId, string? bannerUrl)
    {
        var bannerId = string.IsNullOrWhiteSpace(groupId) ? null : groupId + "_banner";
        var cached   = FindCachedFile("Groups", bannerId);
        if (cached != null) return ToLocalUrl(cached);
        if (!string.IsNullOrWhiteSpace(bannerId) && !string.IsNullOrWhiteSpace(bannerUrl))
            _ = CacheAsync("Groups", bannerId, bannerUrl, false);
        return bannerUrl ?? "";
    }
// Users

    public static string? GetUserCached(string? userId)
        => FindCachedFile("Users", userId);

    public static string? GetUserBannerCached(string? userId)
        => FindCachedFile("Users", userId == null ? null : userId + "_banner");

    public static string GetUserUrl(string? userId, string? iconUrl)
    {
        var cached = GetUserCached(userId);
        if (cached != null) return ToLocalUrl(cached);
        if (!string.IsNullOrWhiteSpace(userId) && !string.IsNullOrWhiteSpace(iconUrl))
            _ = CacheAsync("Users", userId, iconUrl, false);
        return iconUrl ?? "";
    }

    public static string GetUserBannerUrl(string? userId, string? bannerUrl)
    {
        var bannerId = userId == null ? null : userId + "_banner";
        var cached = GetUserBannerCached(userId);
        if (cached != null) return ToLocalUrl(cached);
        if (!string.IsNullOrWhiteSpace(bannerId) && !string.IsNullOrWhiteSpace(bannerUrl))
            _ = CacheAsync("Users", bannerId, bannerUrl, false);
        return bannerUrl ?? "";
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
        CacheAvatarBackground(avatarId, imageUrl);
        return imageUrl ?? "";
    }
// Core

    private static Task<string?> CacheAsync(string subdir, string? entityId, string? imageUrl, bool forceRefresh)
    {
        if (string.IsNullOrWhiteSpace(entityId) || string.IsNullOrWhiteSpace(imageUrl) || _http == null)
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
        var dir     = Path.Combine(_baseDir, subdir);
        var tmpPath = Path.Combine(dir, entityId + ".tmp");

        try
        {
            using var resp = await _http!.GetAsync(imageUrl, HttpCompletionOption.ResponseHeadersRead);
            if (!resp.IsSuccessStatusCode) return null;

            using (var stream = await resp.Content.ReadAsStreamAsync())
            using (var fs    = File.Create(tmpPath))
                await stream.CopyToAsync(fs);
        }
        catch
        {
            TryDelete(tmpPath);
            return null;
        }

        var ext = DetectExtension(tmpPath);
        if (ext == null)
        {
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

    private static void TryDelete(string path)
    {
        try { if (File.Exists(path)) File.Delete(path); } catch { }
    }
}
