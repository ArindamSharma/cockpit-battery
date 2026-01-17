#!/bin/bash
# Extract and format battery information for Cockpit widget

OUTPUT=$(upower -i /org/freedesktop/UPower/devices/battery_BAT0 2>&1)

if [ $? -ne 0 ]; then
    echo "ERROR: Unable to read battery information"
    exit 1
fi

echo "$OUTPUT"
