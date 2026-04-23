**2026.17.2**

**Profiles**

* Added "User Activity" below "Timeline", displaying the latest 10 user activities
* Changed the "Representing Group" information within user profiles. It is now shown next to the user status instead of taking up space in the Info tab
* The Representing section in the Group tab remains unchanged
* The offline badge is now hidden, as the user status already makes this clear

**Performance**

* Reduced WebView2 memory usage by around 60 MB through Chromium browser flags, including disabling the GPU process, limiting the JavaScript heap to 64 MB, and disabling disk cache and background networking
* Improved World data loading by using cached database data
* Improved Profile data loading by using cached database data
* Improved Avatar data loading by using cached database data
* Improved Group data loading by using cached database data
* Removed Animations of Modals when switching within them.

**Fixes**

* Removed the CSS `border-radius` from the app root. Window corners are now sharp, allowing Windows to handle rounding and fixing visible rounded edges when Legacy Window mode is enabled
* Fixed the “VRCNext is already running” popup appearing during restart scenarios such as language changes or Legacy Window toggles. The new instance now waits for the old process to fully exit before acquiring the mutex
* Localized the “already running” message for all supported languages: EN, DE, ES, FR, JA, ZH-CN
* Fixed banners reloading on every VRCNext restart. They are now kept in cache during the current session
* Fixed a rendering issue that caused the Avatar modal to appear behind a user profile when opened through "Current Avatar" or the Content tab

**Navigation**

* Added breadcrumb navigation to all modals (Profile, World, Group, Avatar, Event), allowing navigation between linked items and making it easy to trace your path back with a single click
