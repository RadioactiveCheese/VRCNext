**2026.19.6**

**Save Notification**
* Added Saving Notification. When you change a setting in various modules or the settings menu you will be notified that your change has been saved.
If the save fails it wil lshow an error. This should never be the case but it is good for the enduser to know if something is saved.

**Database**
* Added database optimization used by the timeline feature.

**Timeline**
* Added status dots in the date picker to show which days have data. One dot means there are entries for either personal or friends logs, two dots means both.
* Added a 500-entry display limit to the timeline. Only the latest 500 events are shown — nothing is deleted. You can still access everything beyond this limit via the search function.
* The display limit can be raised up to 10,000 entries in the settings. Disabling database optimization entirely is not recommended, especially if your database exceeds 200 MB — doing so may result in over 1 GB of RAM usage, slow search results, and potential crashes depending on your hardware.

**Avatar Scaling**
* Added avatar scaling endpoints: `/avatar/eyeheight` (read/write), `/avatar/eyeheightmin`, `/avatar/eyeheightmax`, `/avatar/eyeheightscalingallowed` — all visible and controllable in the OSC parameter list (requires VRChat build 1834+).

**Bug Fixes**
* Fixed webhook channel toggles and URL/name fields not saving when changed directly in the media relay panel. Changes now correctly trigger an auto-save.
