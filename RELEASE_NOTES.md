**2026.20.2**

**Improvements**
- Images in the Rose Database, Inventory, Timeline, and Calendar / Group events are now properly cached and load from disk on subsequent visits instead of fetching from the network every time
- World data is now cached for 24 hours, noticeably reducing the number of network requests made at startup

**Activity Log**
- A command prompt (`>`) has been added at the bottom of the Activity Log — type a command and press Enter to run it
- `/help` — lists all available commands
- `/debug img cache true/false` — shows or hides the image cache debug overlay
- The command input is now part of the log panel, styled like a terminal
- Multi-line command output now displays each line on its own row instead of everything on a single line

**Bug Fixes**
- Fixed: Inventory images (Photos, Icons, Emojis, Stickers, Prints) showed as uncached after a restart
- Fixed: Avatar icons in Timeline avatar-switch events were showing the wrong image
- Fixed: The image cache debug overlay was always visible on startup even when it was turned off
