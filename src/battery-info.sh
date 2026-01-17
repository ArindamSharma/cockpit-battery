#!/bin/bash
# Extract and format battery information for Cockpit widget

# Get battery information
BATTERY_OUTPUT=$(upower -i /org/freedesktop/UPower/devices/battery_BAT0 2>&1)

if [ $? -ne 0 ]; then
    echo "ERROR: Unable to read battery information"
    exit 1
fi

# Get AC adapter information - try common device names
AC_ONLINE="no"

# Try different possible AC adapter paths
for ac_path in /org/freedesktop/UPower/devices/line_power_ADP0 \
               /org/freedesktop/UPower/devices/line_power_AC \
               /org/freedesktop/UPower/devices/line_power_ACAD; do
    AC_OUTPUT=$(upower -i "$ac_path" 2>/dev/null)
    if [ $? -eq 0 ]; then
        # Check if online: yes
        if echo "$AC_OUTPUT" | grep -qi "online:.*yes"; then
            AC_ONLINE="yes"
            break
        fi
    fi
done

# Output battery info
echo "$BATTERY_OUTPUT"
echo ""
echo "--- AC Power ---"
echo "ac-online: $AC_ONLINE"
