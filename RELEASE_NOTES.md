**2026.18.8**

**New**
* Added Tooltips in all languages
* Added an app information and disclaimer section for VRCNext, including usage notes, VRChat trademark notice, and responsible-use information.

**Settings**
* Refactored the whole settings design to be more simple

**VR Overlay**
* Replaced the "Youtube Fix" button within the VR Overlay to "Kikitan XD" as i didn't saw a high usage for it in the overlay compared to Kikitan XD.

**Kikitan XD**
* Added Info below the api key section so users understand how to setup Kikitan XD.

**Changes**

* Topbar shortcuts such as Media Relay and Space Flight now use icons without text
* Topbar shortcuts can now be toggled by clicking their icons
* Added hover tooltips to all topbar icons
* Added Discord Presence to the Topbar
* Added YouTube Fix to the Topbar
* Added Kikitan XD to the Topbar
* Added VR Overlay to the Topbar
* Moved System tray below Performance settings and added tips

**Time Spent**
* Fixed world images and names being re-fetched from the VRChat API every time the Time Spent tab is opened. They are now only fetched once and persisted — subsequent opens use the cached data.
* Fixed worlds with 0 seconds appearing in the Time Spent world list.

**Fixed**

* Auto Color now keeps working after selecting a dashboard background
* Improved stability when checking if VRChat or SteamVR is running
* Fixed Timeline loading too many times at once
* Fixed a memory leak in the Timeline and Group Event date pickers
* Fixed a crash when closing the Timeline date picker
* Session resume errors are now shown properly instead of failing silently
* Improved Media Relay retry stability
* Fixed dashboard world refresh cleanup behavior
