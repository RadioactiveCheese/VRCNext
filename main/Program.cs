using VRCNext.Services;

namespace VRCNext;

static class Program
{
    [STAThread]
    static void Main(string[] args)
    {
        if (args.Length >= 4 && args[0] == "--watchdog")
        {
            if (!AcquireMutex("Global\\VRCNext_Watchdog", out var wdMutex)) return;
            using (wdMutex) WatchdogRunner.Run(args);
            return;
        }

        if (args.Length >= 1 && args[0] == "--vr-subprocess")
        {
            if (!AcquireMutex("Global\\VRCNext_VROverlay", out var vrMutex)) return;
            using (vrMutex) VRSubprocess.Run();
            return;
        }

        if (!AcquireMutex("Global\\VRCNext", out var mainMutex, showError: true)) return;
        using (mainMutex)
        {
            CrashHandler.Register();
            Velopack.VelopackApp.Build().Run();
            new AppShell(args).Run();
        }
    }

    static bool AcquireMutex(string name, out Mutex mutex, bool showError = false)
    {
        mutex = new Mutex(initiallyOwned: true, name: name, out bool createdNew);
        if (createdNew) return true;

        mutex.Dispose();
        if (showError)
            MessageBox.Show(
                "VRCNext läuft bereits.\nBitte schließe die laufende Instanz zuerst.",
                "VRCNext", MessageBoxButtons.OK,
                MessageBoxIcon.Information);
        return false;
    }
}
