## What's New in 2026.5.1

### VRCN Messenger

- **In-App Chat** - Send and receive messages with friends directly inside VRCNext. The messenger uses VRChat invite message slots as a transport layer — no third-party services involved.
- **iMessage-Style UI** - A floating panel opens bottom-right with sent messages on the right (accent color) and received messages on the left, including timestamps.
- **24 Message Slots** - Combines 12 standard invite slots and 12 request-invite slots for a total of 24 slots, allowing roughly one message every 2.5 minutes.
- **Smart Slot Management** - Before sending, VRCNext fetches the real cooldown state from the VRChat API for all 24 slots. Only free slots are used — no guessing, no 429 spam.
- **Character Limit Counter** - The input field shows a live countdown of remaining characters (60 max, accounting for the internal `msg ` prefix). Turns orange near the limit and red when almost full.
- **Slot Usage Ring** - A circular progress indicator in the messenger header shows how many of your 24 slots are currently in cooldown. Color shifts from green to orange to red as usage increases.
- **Profile Picture** - The messenger header shows the recipient's VRChat profile picture.
- **Status Display** - The subtitle line shows the recipient's current status text (or status label if no text is set), with a colored status dot in the avatar corner.
- **Chat History** - Conversation history is stored locally per user in `%AppData%\VRCNext\chat\` and loaded automatically when opening a conversation.
- **Open via Right-Click** - Right-clicking a friend in any view shows a new **Messenger** option in the context menu.
- **Message Inbox** - A new messages icon (left of the notification bell) collects incoming messages received while the messenger is closed. Shows a badge count and opens a panel listing all unread conversations with avatar, name, message preview, and timestamp. Clicking an entry opens the full conversation.
- **Auto-Intercept** - Incoming VRCN messages are automatically detected and silently hidden from the standard notification feed — they appear only in the messenger and inbox.
- **Cooldown Feedback** - If a send fails due to an unexpected cooldown, a warning bar appears briefly inside the messenger without disabling the input for long.
