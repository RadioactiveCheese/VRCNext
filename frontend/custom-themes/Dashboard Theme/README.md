# VRCNext Custom Themes

Custom themes are folders placed inside the `custom-themes` directory in your VRCNext AppData folder:

```
%AppData%\Roaming\VRCNext\custom-themes\
```

Each theme is a subfolder. The folder name is the display name shown in Settings.

---

## Folder Structure

```
custom-themes/
  My Theme/
    styles.css
    script.js       (optional)
    info.json       (optional)
```

---

## Files

### CSS (required)
One or more `.css` files. All `.css` files in the folder are loaded when the theme is enabled.
Use standard CSS to override any VRCNext styles. VRCNext does not restrict what you can target.

### JS (optional)
One or more `.js` files. Loaded as scripts when the theme is enabled.

If your JS sets up event listeners or modifies the DOM, implement a cleanup handler so things are properly reversed when the theme is toggled off:

```js
(function () {
    const THEME_ID = 'My Theme'; // must match the folder name exactly

    function myHandler() {
        // your logic
    }

    function cleanup() {
        // remove listeners, revert DOM changes, clear intervals, etc.
        document.documentElement.removeEventListener('vrcnext:theme:unload:' + THEME_ID, cleanup);
    }

    // setup
    document.addEventListener('scroll', myHandler, { passive: true });
    document.documentElement.addEventListener('vrcnext:theme:unload:' + THEME_ID, cleanup);
}());
```

When the user toggles the theme off, VRCNext dispatches `vrcnext:theme:unload:<folder name>` on `document.documentElement`.

### info.json (optional)
Displays author and version in the Themes settings tab.

```json
{
  "author": "Your Name",
  "version": "1.0.0"
}
```

---

## CSS Variables

VRCNext exposes theme color variables you can use in your CSS:

| Variable | Description |
|---|---|
| `--bg-base` | Main background color |
| `--bg-side` | Sidebar background color |
| `--bg-input` | Input field background |
| `--bg-hover` | Hover state background |
| `--accent` | Accent color |
| `--tx0` | Primary text |
| `--tx1` | Secondary text |
| `--tx2` | Muted text |
| `--tx3` | Faint text |
| `--sidebar-w` | Left sidebar width (expanded) |
| `--sidebar-c` | Left sidebar width (collapsed) |
| `--rsidebar-w` | Right sidebar width (expanded) |
| `--rsidebar-c` | Right sidebar width (collapsed) |

---

## Notes

- VRCNext must be restarted or the Themes tab re-opened for newly added theme folders to appear.
- Multiple themes can be active at the same time.
- Themes load in alphabetical order by folder name.
- The `THEME_ID` in your JS must match the folder name exactly, including capitalization and spaces.
