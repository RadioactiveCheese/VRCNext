using VRCNext.Services;

namespace VRCNext;

static class Program
{
    [STAThread]
    static void Main(string[] args)
    {
        // Before Check and Register of Watchdogs Mark: Watchdog test
        if (args.Length >= 4 && args[0] == "--watchdog")
        {
            WatchdogRunner.Run(args);
            return;
        }

        CrashHandler.Register();
        Velopack.VelopackApp.Build().Run();
        new AppShell(args).Run();
    }
}
