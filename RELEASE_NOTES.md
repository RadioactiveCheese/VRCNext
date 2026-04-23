**2026.18.0**

This update is mostly focused on design consistency. Many modals did not share the same padding and CSS, so those styles have now been unified. It also includes a number of bug fixes following my database and modal system refactor, which had caused the context menu to stop working as intended.

**Changes And New**
- Unified left/right padding across all modals — World Detail, World Search, Create Instance, My Instance, Avatar Detail, Permini Picker, and all Timeline detail modals now match the 32px side spacing of the User/Profile modal
- Timeline list view columns now have fixed widths across all categories and subcategories — switching filters no longer causes columns to shift or rebalance
- Context menu: Added "Invite to Group" option when right-clicking a friend — shows a submenu of joined groups with invite permission; selecting a group directly sends the invite without opening a modal
- New dashboard widgets: Group Activity (normal large cards) and Group Activity (Small) — show active instances across all joined groups; large cards mirror the Friends Location layout, small cards mirror Friends Location (Small); clicking an instance opens the instance detail modal

**Fixes**
- Fixed Group Invite modal appearing behind the Group Detail modal — `modalInvite` had no explicit z-index (defaulted to 10000, below `modalDetail`'s 10001); now set to 10002
- Fixed Invite modal world title and subtitle not aligned with the search bar and friend list below — `.inv-world-info` was positioned at 16px from the left instead of 32px
- Fixed Kikitan XD noise gate marker not showing at the correct position on initialization — `updateKxdMeter` was not called when settings were loaded, so the gate line stayed at 0% until the slider was moved
- Fixed white stripe appearing at the bottom of scrollable areas (Timeline, modals, etc.) — caused by unstyled browser-default scrollbars; all scrollbars are now globally themed to match the dark UI
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