namespace VRCNext;

static class Program
{
    [STAThread]
    static void Main()
    {
        Velopack.VelopackApp.Build().Run();
        ApplicationConfiguration.Initialize();
        Application.Run(new MainForm());
    }
}
