## What's New in 2026.3.5

### Timeline
- **Instance History in Timeline** - The timeline now logs full instance details when you are with friends. You can see who was there, who you were with, the instance type, and exactly when it happened.

---

### Profile Images
- **Correct Profile and Header Images** - Profile images and header/banner images are now displayed correctly in all sections of the app. Previously some areas showed the wrong image.
- **Profile Image Handling Refactored** - The database, friend/follow cache (FFC), and image cache now handle profile data in a unified, non-destructive way. Existing data is preserved across updates.
- **Banner vs. Icon Fix** - Several JavaScript sections were incorrectly showing the profile banner instead of the profile icon inside modals. This is now fixed across all affected modals.

---

### UI Components and Code
- **Profile_Item Component** - Group Members, Profile Mutuals, and World Preview user lists now use a shared `Profile_Item.js` component with the `fd-profile-item` style. This reduces duplicated code and keeps the design consistent.
- **Profile_Item_Small Component** - Timeline user lists, Photo user lists, and other modals that only need a profile image and name now use a shared `Profile_Item_Small.js` component with `fd-profile-item-small`. This makes compact user listings simpler and removes more redundant code.
- **Instance_Item Component** - The World Modal active instances list and the Profile current world section now share the `Instance_Item.js` component. This removes duplicated CSS and JavaScript.
- **World Image in Instance Items** - Instance items now show the world image, giving them a cleaner look closer to how VRChat displays instances natively.
- **Profile Modal UI Improvements** - Some UI elements in the profile modal have been adjusted to make information clearer and easier to read.
- **Duplicate CSS Removed** - Several CSS segments that produced identical designs for the same elements have been removed and consolidated.

---

### Instances and Worlds
- **Instance Name Display** - The World Modal active instances list now shows the instance name.
- **Instance Group Display** - The World Modal active instances list now shows the associated group when the instance belongs to one.
- **Group Link in Instances** - When a Group Public, Group, or Group+ instance is shown in the World Modal active instances list, you can now click the group name to open the Group Modal directly.

---

### Time Spent
- **Detailed Time Display** - Time spent now shows Days, Hours, Minutes, and Seconds in the Time Spent tab, World Modal, and Friends Modal for precise statistics.
- **Compact Format in Summary Panels** - Two summary panels that previously showed lowercase d, h, m, s now use uppercase D and H to save space without losing clarity.

---

### Notifications
- **Notifications v2 Support** - VRCNext now supports the VRChat Notifications v2 API, which provides a significantly wider range of notification types. The following notification types are now handled:

| Type | Description |
|---|---|
| `group.invite` | Someone has invited you to join a group |
| `group.joinRequest` | A user has requested to join your group |
| `group.informative` | General information notification from a group |
| `group.announcement` | An announcement has been posted in a group you are part of |
| `group.transfer` | Group ownership is being transferred to you |
| `group.post.created` | A new post has been created in a group you follow |
| `group.post.published` | A group post has been published |
| `group.audit` | An audit log event occurred in your group |
| `group.event.created` | A new event was created in a group you follow |
| `group.event.starting` | A group event you follow is starting soon |

---

### Groups
- **Events Tab** - Opening the Events tab inside a group now loads and displays that group's upcoming events.
- **Refresh Button** - A Refresh button has been added to the Groups tab. The tab also refreshes automatically when you join or leave a group.

---

### Friends Sidebar
- **Favorites Section** - A Favorites section has been added to the top of the Friends sidebar, above the In-Game section. Favorited friends are always shown regardless of whether they are online or offline.
- **Expand and Collapse Sections** - You can now expand and collapse the In-Game and Online/Web player sections in the sidebar.
- **Persistent Sidebar State** - The expanded or collapsed state of each sidebar section, such as Favorites, In-Game, and Online/Web, is now saved between sessions.

---

### Worlds Tab
- **Favorites Count Display** - The Favorites dropdown list now shows how many worlds are in each group using a XX/XX counter so you can see group capacity at a glance.
- **My Worlds Sub-tab** - A new My Worlds sub-tab has been added between Favorites and Search. It shows all worlds you have uploaded to VRChat, including private ones.

---

### Calendar
- **Calendar Feature** - A new Calendar section is now available in the sidebar. It shows upcoming VRChat events in a monthly calendar view.
- **Event Details Modal** - Clicking an event opens a detail modal showing the event title, date, time, image, description, organizer group, and tags.
- **Follow Events** - You can follow or unfollow an event directly from the event detail modal.
- **Tools Menu Default State** - The Tools submenu in the sidebar is now collapsed by default. Its open or closed state is saved between sessions.

---

### Context Menu
- **Boop** - Right-clicking a user profile now includes a "Boop!" option to send a boop notification.
- **Share Profile** - Right-clicking a user profile now includes a "Share Profile" option that copies the VRChat profile URL to your clipboard.
- **Share World** - Right-clicking a world now includes a "Share World" option that copies the VRChat world URL to your clipboard.
- **Set as Home World** - Right-clicking a world now includes a "Set as Home" option to set that world as your VRChat home world.
- **My Worlds Context Menu** - Worlds in the My Worlds tab support the same right-click context menu as all other world cards.
- **Share Group** - Right-clicking a group now includes a "Share Group" option that copies the VRChat group URL to your clipboard.
- **Share Avatar** - Right-clicking an avatar card now includes a "Share Avatar" option that copies the VRChat avatar URL to your clipboard.
- **Use Avatar** - Right-clicking an avatar card now includes a "Use Avatar" option to switch to that avatar directly, the same as clicking the card.

---

## What's New in 2026.3.0
### Tools
- **Time Spent** - New major feature added under Tools. Time Spent shows how long you have spent in each world and automatically ranks them based on your total time. You can also see how much time you have spent with specific friends and even with individual users who are not on your friends list.

The feature displays:
- Total VRChat time tracked by VRCNext
- Total social time in hours
- Number of unique people you have met
- Time spent with friends and non-friends separately
- Number of unique worlds discovered
- Total instance joins

> Note: Total VRChat time may differ from your Steam playtime, especially if you started using VRCNext later.

---

## What's New in 2026.2.5-2
### UI and Design
- **Dashboard Hero** - Refreshed the hero section with a slightly more modern layout and visual feel.
- **Group Images** - Group images now open in an inline viewer inside VRCNext instead of launching an external browser window.
- **Media Library - Improved Layout** - The gallery now extends to the full height of the screen, matching the Inventory tab behavior. No more early cutoff at the bottom.
- **Media Library - Fade Effects** - A smooth theme-colored fade now appears at the bottom of the gallery at all times, and fades in at the top once you have scrolled down past the first section, keeping the layout clean and polished.

### Window and Navigation
- **Drag Region Expanded** - Both the Menu Sidebar and the Friends Sidebar can now be used to drag the application window, in addition to the existing center drag area.

### Friends and Social
- **Mutual Network** - New tool under Tools that visualizes your entire friend circle as an interactive force-directed graph. Nodes represent friends, edges connect two friends who are mutual with each other. The graph reflects live online status via colored status rings. Supports zoom, pan, drag-to-pin, and click-to-focus. Right-clicking a node opens the standard context menu.

### Context Menu
A right-click context menu is now available in several places throughout the app:

- **Friends List - Friend Entry** - View Profile, Send Invite, Request Invite, Join, Unfriend, Mute/Unmute, Favorite/Unfavorite, Send Invite with Message.
- **Friends List - Your Profile** - Quickly switch your status between Online, Join Me, Ask Me, and Do Not Disturb, or open your own profile.
- **Friends List - Instance Info** - Favorite the current world or open the world modal directly from the instance row beneath your profile.
- **Worlds Tab and Dashboard** - Add a world to favorites, remove it from favorites, or open its detail modal.
- **Groups** - View a group, leave a group, or create a post (visible only when you have post permissions).
- **Mutual Network Canvas** - Right-click any friend node to access the same friend actions available in the friends list.
- **Profile Modal - Mutuals** - Right-clicking a mutual friend in the profile modal now opens the context menu.
- **Add Friend** - When right-clicking a user you are not yet friends with, a "Send Friend Request" option is shown instead of the friend-only actions.
- **Cross-modal stacking fixed** - Opening a friend profile from within the group member list or mutual cards now correctly displays on top of the parent modal.

### Interactions and Feedback
- **Notifications Panel** - Clicking outside the notification panel now automatically closes it.
- **World Favoriting Confirmation** - When favoriting a world, a breadcrumb notification confirms the action.
- **External Links** - Specific links now open in the system's default browser instead of within the app.

### Group Management
- **Delete Group Posts** - A delete icon is now shown on group posts when you have group management permissions, allowing posts to be removed directly from the feed.
