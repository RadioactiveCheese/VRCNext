**2026.20.6**

**Improved Caching System**
Caching has been updated and it will now always show actual content.
Content that hasnt been updated will use old cached images.

**OSC Chat**

* Added a new feature to Custom Chatbox.
* You can now use Custom Chatbox as a normal chat.
* A chat window is now available where you can type and send messages. These messages will be shown in VRChat.
* This can be used in Desktop and VR mode.
* In VR, it may be a little tricky to use. It is recommended to increase the SteamVR Overlay UI size for easier usage.
* A wrist overlay tab may be added in the future.

**User Preview**

* Made the preview modal slightly bigger to provide more space for all UI elements.
* The preview now shows the number of people in the instance.
* The preview now shows the server location.

**Improvements**

* Images in the Rose Database, Inventory, Timeline, Calendar, and Group Events are now properly cached and loaded from disk on subsequent visits instead of being fetched from the network every time.
* World data is now cached for 24 hours, noticeably reducing the number of network requests made on startup.
* VRChat’s WebSocket now sends data when a user changes their profile image. Previously, images were only refreshed when the user changed their status. Images are now updated correctly.
* Redesigned the Custom Chatbox tab to better match the new UI style of the Settings tab.
* Cleaned up various UI parts of VRCN.

**Activity Log**

* Added a command prompt (`>`) at the bottom of the Activity Log. Type a command and press Enter to run it.
* Added `/help`, which lists all available commands.
* Added `/debug img cache true/false`, which shows or hides the image cache debug overlay.
* The command input is now part of the log panel and is styled like a terminal.
* Multi-line command output now displays each line on its own row instead of everything on a single line.

**Bug Fixes**

* Fixed an issue where Inventory images, including Photos, Icons, Emojis, Stickers, and Prints, showed as uncached after a restart.
* Fixed an issue where avatar icons in Timeline avatar-switch events showed the wrong image.
* Fixed an issue where the image cache debug overlay was always visible on startup, even when it was turned off.
* Fixed an issue where updated world images still showed the old cached image.
* Fixed an issue where updated group images still showed the old cached image.
* Fixed an issue where updated avatar images still showed the old cached image.
* Fixed an issue where updated user images still showed the old cached image.
* Fixed an issue where updated friend images still showed the old cached image.
* Fixed an issue where updated event images still showed the old cached image.
* Fixed an issue where the Live Preview in Custom Chatbox showed 2 squares at the end caused by Custom Lines.
* Fixed an issue where Timeline events with older avatar images would overwrite the correctly cached newer version, causing avatars to flicker between old and new images.
