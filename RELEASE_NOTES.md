# 2026.10.5

## REST API & WebSocket
Significantly reduced the number of REST GET requests by moving most data fetching to WebSocket events only. Removed the redundant `GET /userNotes?n=100` call when opening a profile, as user note data is already included in the `GET /users/{userId}` response.

## New Features

**Invite with Image**
Friends can now be invited to your current instance with an image attached (VRC+ required). Available via right-click context menu on any friend.

## Logs
The activity log section now displays a maximum of 500 entries. Full logs are written to `/Logs/log-xxxx-xxx.txt`. The export button has been removed and replaced with three new actions: Copy to Clipboard, Open Logs, and Open Folder. Request and response information is now shown at the top of the log view.

## Instance Info
The instance panel now displays the status and status text of players in the instance. Clicking an instance in the friends sidebar opens a new modal showing all players along with additional information. Friends and other players in the instance are now listed in separate sections.

## Context Menu
Right-clicking works on all entries in the People tab.

## Upload
Group posts and event posts now use the inventory upload modal for image selection, which includes drag-and-drop support and automatic compression.

## Changes
Reduced API request frequency for the global online player count. Discord presence preview now shows a placeholder image when none is available. Added a missing title to the Discord Presence tab. The periodic 5-minute REST refresh has been removed entirely — a REST call is only made when the WebSocket fails to connect, which should rarely occur outside of VRChat maintenance windows.

## Bug Fixes
Fixed an issue where opening a non-friended profile did not show their online status or status text. Fixed a memory leak caused by log entries and images not being disposed correctly during long sessions. Fixed an issue where a friend's location was not displayed correctly. Fixed an issue where the status text of offline friends was not visible.

## Removals
The Timeline section in profiles has been removed. The export logs button has been replaced by Copy to Clipboard, Open Logs, and Open Folder actions.
