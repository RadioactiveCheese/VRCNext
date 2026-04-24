**2026.18.6**

**Friends Sidebar Redesign**
Status indicators now appear as a badge overlaid on the avatar image (Messenger-style) instead of a colored border.
- Online/offline/busy/ask/join me friends show a filled dot at the bottom-right of their avatar
- Web presence friends show a hollow ring instead of a filled dot
- Your own profile at the top uses the same badge — the old colored frame around your avatar is removed
- Collapsed sidebar: instance cards no longer have a colored border; a small dot in the instance type color (green = Public, blue = Friends+, red = Invite, orange = Group) is shown instead

**Performance Settings**
Added a new Performance card in Settings with four toggleable options (all off by default). A restart button appears automatically when any setting is changed.
- **Enable Hardware Acceleration** — turns on GPU rendering in WebView2
- **Enable GPU Shader Cache** — caches compiled shaders to disk for faster startup
- **Use 128 MB V8 Heap** — raises the JavaScript memory limit from 64 MB to 128 MB
- **Use 2 Render Processes** — allows WebView2 to use up to two renderer processes

**Fixes**
- Fixed Group Activity dashboard widgets showing no results
- Fixed Group Activity widgets showing 0 players per instance
- Group Activity now fetches all instances in 2 API calls instead of N+1 calls per group
- Fixed Dashboard Theme sidebars clipping content at the bottom when UI zoom is changed via Ctrl+Scroll