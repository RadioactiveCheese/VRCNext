**2026.18.7**

**Changes**

* Redesigned the Friends sidebar. Collapsed sections now use icons instead of short labels like “GME” or “OFF”
* Added smooth animations when opening and collapsing the Friends sidebar
* Added high-contrast text across all designs for improved readability

**New**

* Added a Friend Preview popup. Hovering over a friend in the collapsed sidebar now shows a quick preview with banner, avatar, status, trust rank, badges, current instance, bio, and language tags
* The current instance in the Friend Preview popup is clickable and can be used to join directly

**Removed**

* Removed the Background Overlay Opacity slider from Settings > Design because it was broken and had no visible effect

**Fixes**

* Clicking a world name in an invite notification now correctly opens the world modal
* Clicking “Current Avatar” on a profile no longer fails when the avatar name contains an apostrophe
* Group modal: clicking an event no longer fails when the event title contains an apostrophe
* Event modal: clicking the organizer group link no longer fails when the group name contains an apostrophe
* World modal: clicking the world author link no longer fails when the author name contains an apostrophe
* User modal: clicking a group or world card no longer fails when the group or world name contains an apostrophe
* Dashboard background images are no longer sent as base64 data URIs over the message bridge — they are now served via the local HTTP listener, eliminating large message spam in the debug console
