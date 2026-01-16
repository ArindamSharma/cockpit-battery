# Creating a Cockpit Dashboard Plugin

This guide explains how to create a custom plugin for Cockpit Web Console, using the Battery Information plugin as an example.

## Overview

Cockpit plugins are modular components that extend the Cockpit web interface. Each plugin lives in its own directory under `/usr/share/cockpit/` and consists of:
- `manifest.json` - Plugin metadata and configuration
- `index.html` - Main HTML page
- External CSS and JavaScript files
- Optional: Additional resources, scripts, or assets

## Step-by-Step Guide

### 1. Create Plugin Directory

```bash
sudo mkdir -p /usr/share/cockpit/your-plugin-name
cd /usr/share/cockpit/your-plugin-name
```

**Location:** All Cockpit plugins must be in `/usr/share/cockpit/`

### 2. Create manifest.json

This file registers your plugin with Cockpit.

```json
{
    "version": 0,
    "requires": {
        "cockpit": "120"
    },
    "name": "your-plugin-name",
    "menu": {
        "index": {
            "label": "Your Plugin Name",
            "order": 15
        }
    }
}
```

**Key fields:**
- `version`: Manifest version (always 0)
- `requires.cockpit`: Minimum Cockpit version
- `name`: Plugin identifier (must match directory name)
- `menu.index.label`: Display name in sidebar
- `menu.index.order`: Position in menu (lower = higher in list)

### 3. Create index.html

Main entry point for your plugin. Must be named `index.html`.

```html
<!DOCTYPE html>
<html>
<head>
  <title>Your Plugin</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="../base1/patternfly.css">
  <link rel="stylesheet" href="style.css">
  <script src="../base1/cockpit.js"></script>
  <script src="app.js"></script>
</head>
<body>
  <div class="container-fluid">
    <h1>Your Plugin</h1>
    <div id="content"></div>
  </div>
</body>
</html>
```

### 4. Create External JavaScript (app.js)

**CRITICAL:** Content Security Policy (CSP) blocks inline JavaScript and CSS.

```javascript
(function() {
    "use strict";
    
    var cockpit = window.cockpit;
    
    function updateData() {
        // Execute shell commands
        cockpit.spawn(["command", "arg1", "arg2"])
            .done(function(data) {
                // Handle success
                document.getElementById('content').textContent = data;
            })
            .fail(function(error) {
                // Handle error
                console.error(error);
            });
    }
    
    document.addEventListener('DOMContentLoaded', function() {
        updateData();
    });
})();
```

### 5. Create External CSS (style.css)

All styles must be in external files due to CSP.

```css
body {
    font-family: sans-serif;
    padding: 20px;
}

.card {
    background: white;
    border-radius: 8px;
    padding: 20px;
}
```

### 6. Set Proper Permissions

```bash
sudo chmod 755 /usr/share/cockpit/your-plugin-name
sudo chmod 644 /usr/share/cockpit/your-plugin-name/*
sudo chown -R root:root /usr/share/cockpit/your-plugin-name
```

### 7. Restart Cockpit

```bash
sudo systemctl restart cockpit.socket
```

Then access your plugin at: `https://your-server:9090`

## Critical Things to Remember

### Content Security Policy (CSP)
**MOST IMPORTANT:** Cockpit enforces strict CSP that blocks:
- ❌ Inline JavaScript (`<script>code here</script>`)
- ❌ Inline CSS (`<style>` tags or `style=""` attributes)
- ❌ `eval()` and similar dynamic code execution

**Solution:** Always use external files:
- ✅ `<script src="app.js"></script>`
- ✅ `<link rel="stylesheet" href="style.css">`

### Using Cockpit APIs

**Execute shell commands:**
```javascript
cockpit.spawn(["command", "arg1", "arg2"])
    .done(function(output) { /* success */ })
    .fail(function(error) { /* error */ });
```

**File operations:**
```javascript
var file = cockpit.file("/path/to/file");
file.read()
    .done(function(content) { /* handle content */ })
    .fail(function(error) { /* handle error */ });
```

**HTTP requests:**
```javascript
cockpit.http("/api/endpoint")
    .get()
    .done(function(data) { /* handle data */ })
    .fail(function(error) { /* handle error */ });
```

### Using PatternFly Framework

Cockpit includes PatternFly CSS framework:

```html
<link rel="stylesheet" href="../base1/patternfly.css">
```

Common PatternFly classes:
- `.pf-v5-c-card` - Card container
- `.pf-v5-c-button` - Buttons
- `.pf-v5-c-alert` - Alerts/notifications
- `.pf-v5-c-form` - Forms
- `.pf-v5-c-page` - Page layout

### File Structure Example

```
/usr/share/cockpit/battery/
├── manifest.json          # Plugin configuration
├── index.html             # Main HTML page
├── battery.js             # Application logic
├── battery.css            # Styling
└── README.md              # Documentation
```

### Common Pitfalls

1. **Inline scripts don't work** - Always use external .js files
2. **Inline styles don't work** - Always use external .css files
3. **File permissions** - Must be readable by cockpit-ws user
4. **manifest.json name** - Must match directory name exactly
5. **Restart required** - Always restart cockpit.socket after changes
6. **Browser cache** - Use Ctrl+F5 to force reload when testing

### Debugging

**Check browser console (F12):**
- Look for CSP violations
- Check for JavaScript errors
- Verify resource loading

**Check Cockpit logs:**
```bash
journalctl -u cockpit.service -u cockpit.socket -f
```

**Verify plugin is loaded:**
```bash
ls -la /usr/share/cockpit/your-plugin-name/
cat /usr/share/cockpit/your-plugin-name/manifest.json
```

## Testing Your Plugin

1. Open browser to `https://your-server:9090`
2. Login with credentials
3. Your plugin should appear in the left sidebar
4. Click to open and verify functionality
5. Check browser console (F12) for errors

## Additional Resources

- [Cockpit Project Documentation](https://cockpit-project.org/guide/latest/)
- [PatternFly Design System](https://www.patternfly.org/)
- [Cockpit API Reference](https://cockpit-project.org/guide/latest/api-cockpit.html)

## Example: Battery Information Plugin

See the files in this directory for a complete working example that:
- Displays real-time battery information using UPower
- Uses PatternFly styling for consistent UI
- Implements auto-refresh every 30 seconds
- Handles errors gracefully
- Follows all Cockpit best practices
