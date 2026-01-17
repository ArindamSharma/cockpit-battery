#!/bin/bash
set -e

# Create target directories
mkdir -p "$DESTDIR/usr/share/cockpit/cockpit-battery"

# Copy files
cp battery-info.sh battery.css battery.js index.html manifest.json "$DESTDIR/usr/share/cockpit/cockpit-battery/"
cp README.md "$DESTDIR/usr/share/cockpit/cockpit-battery/" || true
