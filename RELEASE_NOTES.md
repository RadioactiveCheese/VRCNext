**2026.19.0**

**Fixed**

* Fixed a black screen on startup caused by WebView2 failing to initialize — VRCNext now uses a dedicated WebView2 user data folder at `%AppData%\VRCNext\WebView2` instead of a shared system temp path