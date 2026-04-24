**2026.18.2**

**New Features**

* Added a Custom Themes system. Theme folders placed in `%AppData%\Roaming\VRCNext\custom-themes\` appear in Settings under Design > Themes and can be toggled on or off individually.
* Each theme folder can contain CSS files, JS files, and an optional `info.json` with author and version, which are displayed in the Themes tab.
* The Dashboard Theme is now included as a built-in custom theme and is off by default. It turns the sidebars into glass overlay panels that fade in as you scroll down on the dashboard.
* Added a Themes pill tab to the Design settings panel alongside Background, Colors, and Other.
* Theme state is saved and restored across restarts.

**Improvements**

* Profile, World, and Group popups now show a smoother loading screen while content is loading.
* Timeline loading now better matches the selected view, using cards for Timeline view and rows for List view.

**Changes**

* Added search to the User Profile Groups tab and Mutual Groups section.
* The new group search is translated for all supported languages.

**Fixes**

* Profile action buttons like Join, Request Invite, and Invite now appear correctly right away.
* Current world names and thumbnails now load faster in friend profiles.
* Player statuses now update immediately in the instance sidebar and instance info popup.
* Friend profile banners are now cached, so they load faster after the first time.
* World images are now cached and load faster when opening the same world again.
