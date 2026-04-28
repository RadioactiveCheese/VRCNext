**2026.19.8**

**Settings**
* Added Database Settings.

**i18n**
* Added missing translations for Content Cards in messenger.
* Added missing translation for people tab and edit mode.

**Media Library**

* Added a new context menu option: “Send to Webhook”. This requires Media Relay to be enabled.
* This sends the selected image to your configured webhook bots.
* Feature request by sophiepastelz.

**People Tab**

* Added favorite friend management in People > Favorites.
* You can now edit all three VRChat favorite friend groups directly in VRCNext.
* You can rename group names, move friends between favorite groups, and manage them similarly to the Worlds and Avatars management editor.
* Feature request by raveen.

**Save Notification**

* Added save notifications. When you change a setting in various modules or in the settings menu, VRCNext now shows a notification confirming that the change was saved.
* If saving fails, an error notification will be shown. This should rarely happen, but it makes it clearer when something was not saved correctly.

**Database**

* Added database optimization for the Timeline feature.

**Timeline**

* Added status dots to the date picker to show which days contain data. One dot means entries exist for either Personal or Friends logs. Two dots means both logs have entries.
* Added a 500-entry display limit to the Timeline. Only the latest 500 events are shown by default. Nothing is deleted, and older entries can still be found using search.
* The display limit can be increased up to 10,000 entries in settings.
* Disabling database optimization entirely is not recommended, especially if your database is larger than 200 MB. This can cause over 1 GB of RAM usage, slower search results, and possible crashes depending on your hardware.

**Caching**
* Added favorite friends caches.

**Avatar Scaling**

* Added avatar scaling OSC endpoints to the OSC parameter list. Requires VRChat build 1834 or newer.
* Added support for `/avatar/eyeheight` as read and write.
* Added support for `/avatar/eyeheightmin`, `/avatar/eyeheightmax`, and `/avatar/eyeheightscalingallowed` as read-only values.

**Bug Fixes**

* Fixed webhook channel toggles and URL/name fields not saving when changed directly in the Media Relay panel. Changes now correctly trigger auto-save.
