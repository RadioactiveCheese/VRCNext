**2026.19.1**

**Fixes**

* Sidebar fixes
* Fixed image caching across the app so images are reused properly and no longer downloaded again and again.
* Fixed broken or unavailable images being retried too often. VRCNext now remembers failed images and avoids requesting them repeatedly.
* Fixed Timeline loading too many old images. Older Timeline entries now use already cached images when available instead of downloading everything again.
* Fixed Time Spent loading too many images at once. Older pages now only show images that are already cached.
* Fixed old Timeline entries not showing images even when those images were already cached somewhere else in the app.
* Fixed your own user image missing in Media Library photo overlays and detail views.
* Fixed instance entries showing `No player data yet` when you joined a world alone.
* Fixed refresh buttons being spam-clickable. Refresh buttons now have a short cooldown and show a countdown before they can be used again.
* Fixed world and user loading so failed requests are handled more safely.
* Fixed API spam protection by keeping the existing backoff system active together with the new refresh cooldowns.
