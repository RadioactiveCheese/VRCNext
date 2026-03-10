# VRCNext 2026.10.2

This release focuses on memory management improvements and quality-of-life fixes for the Media Library,
along with paginator improvements across Timeline and Media Library.

---

## Memory Fixes

- The Media Library now uses **pagination** and never renders more than 50 items at a time, preventing unbounded memory growth
- All 50 preview images now load as **thumbnails** instead of full-resolution files, significantly reducing memory pressure
- Memory usage in the WebView2 worker process should now stay within approximately **500 MB** during normal Media Library usage

---

## Changes

- Moved the **pagination bar** to a fixed position at the bottom of the Timeline and Media Library — it is now always visible regardless of scroll position
- Redesigned the **paginator** to be more compact and easier to navigate — the layout is consistent and never shifts as you move between pages

---

## Fixes

- Fixed an issue where **favoriting, deleting, or censoring** an image in the Media Library would reset the user back to page 1
- Fixed an issue where **favoriting, deleting, or censoring** an image would scroll the view back to the top of the page
- Most of these issues were introduced during the Photino.NET port when the Media Library was reworked — they should now all be resolved
