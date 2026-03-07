using System.Runtime.InteropServices;

namespace VRCNext;

public partial class MainForm
{
    // P/Invoke for borderless window drag / native window management
    [DllImport("user32.dll")] private static extern bool ReleaseCapture();
    [DllImport("user32.dll")] private static extern int SendMessage(IntPtr hWnd, int Msg, int wParam, int lParam);
    [DllImport("user32.dll")] private static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
    [DllImport("Gdi32.dll")]  private static extern IntPtr CreateRoundRectRgn(int l, int t, int r, int b, int w, int h);
    [DllImport("dwmapi.dll")] private static extern int DwmSetWindowAttribute(IntPtr hwnd, int attr, ref int attrValue, int attrSize);
    [DllImport("user32.dll")] private static extern int  GetWindowLong(IntPtr hWnd, int nIndex);
    [DllImport("user32.dll")] private static extern int  SetWindowLong(IntPtr hWnd, int nIndex, int dwNewLong);
    [DllImport("user32.dll")] private static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int x, int y, int cx, int cy, uint uFlags);

    private const int  GWL_STYLE        = -16;
    private const int  WS_CAPTION       = 0x00C00000;
    private const int  WS_THICKFRAME    = 0x00040000;
    private const uint SWP_FRAMECHANGED = 0x0020;
    private const uint SWP_NOMOVE       = 0x0002;
    private const uint SWP_NOSIZE       = 0x0001;
    private const uint SWP_NOZORDER     = 0x0004;

    private const int WM_NCCALCSIZE      = 0x0083;
    private const int WM_NCLBUTTONDBLCLK = 0x00A3;
    private const int HTCAPTION          = 2;

    protected override void OnHandleCreated(EventArgs e)
    {
        base.OnHandleCreated(e);
        // Enable Windows 11 native rounded corners (DWMWCP_ROUND = 2)
        var pref = 2;
        DwmSetWindowAttribute(Handle, 33 /* DWMWA_WINDOW_CORNER_PREFERENCE */, ref pref, sizeof(int));
    }

    protected override void WndProc(ref Message m)
    {
        // Extend client area to cover the native title bar so it is invisible,
        // while keeping WS_THICKFRAME + WS_CAPTION for Aero Snap and edge-tiling.
        if (m.Msg == WM_NCCALCSIZE && m.WParam != IntPtr.Zero)
        {
            m.Result = IntPtr.Zero;
            return;
        }

        // With FormBorderStyle.Sizable, Windows routes title-bar double-click here
        // as a non-client message (WM_NCLBUTTONDBLCLK) rather than through WebView2.
        if (m.Msg == WM_NCLBUTTONDBLCLK && m.WParam.ToInt32() == HTCAPTION)
        {
            WindowState = WindowState == FormWindowState.Maximized
                ? FormWindowState.Normal
                : FormWindowState.Maximized;
            SendToJS("windowMaxState", WindowState == FormWindowState.Maximized);
            return;
        }

        base.WndProc(ref m);
    }
}
