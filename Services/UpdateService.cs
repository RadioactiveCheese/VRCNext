using Velopack;
using Velopack.Sources;

namespace VRCNext.Services;

public class UpdateService
{
    // TODO: Replace with your actual GitHub repo URL
    private const string RepoUrl = "https://github.com/shinyflvre/VRCNext";

    private UpdateManager? _mgr;
    private UpdateInfo?    _pending;

    public UpdateService()
    {
        try { _mgr = new UpdateManager(new GithubSource(RepoUrl, null, false)); }
        catch { /* not installed via Velopack (e.g. dev/debug run) */ }
    }

    /// <summary>Returns the new version string if an update is available, otherwise null.</summary>
    public async Task<string?> CheckAsync()
    {
        if (_mgr == null) return null;
        try
        {
            _pending = await _mgr.CheckForUpdatesAsync();
            return _pending?.TargetFullRelease.Version.ToString();
        }
        catch { return null; }
    }

    /// <summary>Downloads the pending update, reporting 0–100 progress.</summary>
    public async Task DownloadAsync(Action<int> onProgress)
    {
        if (_mgr == null || _pending == null) return;
        await _mgr.DownloadUpdatesAsync(_pending, onProgress);
    }

    /// <summary>Applies the downloaded update and restarts the app.</summary>
    public void ApplyAndRestart()
    {
        if (_mgr == null || _pending == null) return;
        _mgr.ApplyUpdatesAndRestart(_pending);
    }
}
