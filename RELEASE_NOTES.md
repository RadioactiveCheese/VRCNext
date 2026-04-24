**2026.18.1**

**Improvements**
- Friend profile, World and Group modals now use a unified full-height loading skeleton (content-modal) with avatar, bio lines, info grid and note section
- Timeline: loading skeleton now matches the active view — card layout for Timeline view, table rows for List view

**Changes**
- User profile: Groups tab and Mutuals > Groups now have a search bar to filter groups by name — search bar is now localized for all supported languages (DE, FR, ES, JA, ZH-CN)

**Fixes**
- Friend profile: "Join", "Request Invite" and "Invite" buttons no longer pop in after opening, visibility is now computed immediately from the already-known location
- Friend profile: current world name and thumbnail no longer pop in after opening, resolved immediately from the already-known world cache
- Instance sidebar and instance info modal: player statuses (own and friends) now update immediately when statuses change, without waiting for the next instance info roundtrip
- Friend profile: banner image is now cached (7-day TTL) and served from local cache on subsequent opens, including after app restart — previously /api/1/file/ URLs were never cached
- World modal: world images (imageUrl + thumbnailImageUrl) are now cached (60-day TTL) and served from local cache immediately on subsequent opens