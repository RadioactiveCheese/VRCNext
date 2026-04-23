**2026.17.4**

**Changes**

**Fixes**
- Fixed right-click context menu not appearing on Friend Location small cards on the dashboard
- Fixed right-click context menu not appearing on Mutual Friends in user profiles
- Fixed right-click context menu not appearing on Group Members / Roles (ban, kick, assign role etc.)
- Fixed right-click context menu not appearing on World cards in user profile (Favorites tab, Worlds tab)
- Fixed "View Profile" in context menu not pushing breadcrumb / opening behind existing modal
- Fixed "Open Details" on Group cards in context menu not pushing breadcrumb
- Fixed "Open Details" on World cards (instance view, world grid) in context menu not pushing breadcrumb
- Fixed VRC clipboard link context menu items (user, world, group, avatar) not pushing breadcrumb
- Instance modal (Friend Locations, My Instances, pasted instance links) is now breadcrumb-compatible: navigating to profiles or worlds from within pushes breadcrumbs, and navigating back works correctly
- Context menu for groups the user is not a member of now shows only Open Details, Share Group, and Join Group (instead of member-only actions like Represent/Leave)
- Context menu now appears on group cards in search results and in user profiles
- Fixed Instance modal content having narrower left/right padding than other modals
- Fixed VRChat session cookies were incorrectly deleted after PC sleep. VRCNext was treating a network error on wake (network not yet ready) as an expired session and wiping the cookies — even though VRChat never invalidated them. Network errors are now correctly distinguished from real auth failures (401/403) and cookies are preserved.
- Fixed Sleep/wake detection: VRCNext now detects when the PC wakes from sleep and automatically restores the WebSocket connection.