**2026.17.2**

**Performance**

- Reduced WebView2 memory usage by around 60 MB via Chromium browser flags (disabled GPU process, capped JS heap to 64 MB, disabled disk cache and background networking)

**Fixes**

- Removed CSS border-radius from the app root — window corners are now sharp and let Windows handle rounding, fixing visible rounded edges when Legacy Window mode is enabled
- Fixed "VRCNext läuft bereits" popup appearing on restart (language change, Legacy Window toggle) — new instance now waits for the old process to fully exit before acquiring the mutex
- Localized the "already running" message for all supported languages (EN, DE, ES, FR, JA, ZH-CN)

**Navigation**

- Added breadcrumb navigation to all modals (Profile, World, Group, Avatar, Event) — navigate between linked items and trace your path back with a single click