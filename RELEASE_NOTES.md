**2026.15.5**

**Crash Reports**

* When automatic reports are disabled, a window will appear the next time VRCNext starts, asking whether you want to send the crash report anonymously with redacted paths. This makes error reporting safe and easy.
* Replaced the old webhook URL with a new hashed one for error reporting. Previously, the webhook URL was exposed in this GitHub repository, which could have made it easy for an attacker to misuse it. Do not worry, this did not put users at risk. The issue was on my side, since anyone could have used the old URL to send fake data.


**Custom Chatbox**

* Added a **Hide Chatbox Background** option to the Custom Chatbox modules.
  When enabled, the chatbox will appear mostly as a small pillar instead of a full box.

**VR Overlay & Space Flight**

* The VR Overlay and Space Flight now run in a separate process instead of the main process. This change was made because SteamVR can sometimes crash with an unknown exception code or encounter native crashes. In those cases, it could previously take down VRCNext as well. With this change, only the VRCNext subprocess that handles VR-related features will crash, while the main application keeps running.

**Fixes**
* Fixed an issue that caused VRCNext to crash when SteamVR has an random crash
* Fixed an issue that caused VRCNext to crash when Virtual Desktop is hard closed on headsets.
* Fixed an issue that caused VRCNext to crash when VirtualStreame.exe is being killed by Taskkill or sys tray kill.
