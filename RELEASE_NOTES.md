**2026.17.3**

- **Fix:** VRChat session cookies were incorrectly deleted after PC sleep. VRCNext was treating a network error on wake (network not yet ready) as an expired session and wiping the cookies — even though VRChat never invalidated them. Network errors are now correctly distinguished from real auth failures (401/403) and cookies are preserved.
- **Fix:** Sleep/wake detection: VRCNext now detects when the PC wakes from sleep and automatically restores the WebSocket connection.

