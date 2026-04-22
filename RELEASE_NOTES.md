**2026.17.1**

**Added**
* **Event Snipe** new tool to monitor group instances and auto-join when a new one appears // contribution by @Akryst
  * Pick a group from your joined groups list, optionally filter by world ID or access type (Public, Group, Group+, Group Public)
  * Auto-join: sends self-invite if VRChat is running, otherwise launches VRChat via Steam automatically
  * Rate-limit backoff, live found-instances log with manual Join buttons
  * Full localization in all 6 supported languages (EN, DE, ES, FR, JA, ZH-CN)

**Changes**
* Avatar images now load at 512px instead of 256px across the entire app

**Fixed**
* Fixed missing avatar images in Timeline (backfill now fetches thumbnails for avatar_switch events)