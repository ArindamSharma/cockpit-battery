#!/bin/bash
set -e

# Set base directory (project root)
BASEDIR="$(cd "$(dirname "$0")/.." && pwd)"
BUILDDIR="$BASEDIR/build"
SRCDIR="$BASEDIR/src"
OUTPUTDIR="$BUILDDIR/output"

# Extract version from control file
VERSION=$(grep '^Version:' "$BUILDDIR/debian/control" | awk '{print $2}')

# Clean previous build
rm -rf "$BUILDDIR/cockpit-battery*"

# Create directory structure
mkdir -p "$BUILDDIR/cockpit-battery_$VERSION/usr/share/cockpit/cockpit-battery"

# Copy files
cp "$SRCDIR/battery-info.sh" \
    "$SRCDIR/battery.css" \
    "$SRCDIR/battery.js" \
    "$SRCDIR/index.html" \
    "$SRCDIR/manifest.json" "$BUILDDIR/cockpit-battery_$VERSION/usr/share/cockpit/cockpit-battery/"

# Create DEBIAN control directory
mkdir -p "$BUILDDIR/cockpit-battery_$VERSION/DEBIAN"
cp "$BUILDDIR/debian/control" "$BUILDDIR/cockpit-battery_$VERSION/DEBIAN/control"

# Copy maintainer scripts if present and make them executable
for s in preinst postinst prerm postrm; do
  if [ -f "$BUILDDIR/debian/$s" ]; then
    cp "$BUILDDIR/debian/$s" "$BUILDDIR/cockpit-battery_$VERSION/DEBIAN/$s"
    chmod 755 "$BUILDDIR/cockpit-battery_$VERSION/DEBIAN/$s" || true
  fi
done

# Build the package
dpkg-deb --build "$BUILDDIR/cockpit-battery_$VERSION" "$OUTPUTDIR/cockpit-battery_$VERSION.deb"

echo "\nDEB package created: $BASEDIR/output/cockpit-battery_$VERSION.deb"
echo "\nDEB package created: $OUTPUTDIR/cockpit-battery_$VERSION.deb"
