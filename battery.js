(function() {
    "use strict";

    var cockpit = window.cockpit;

    function parseBatteryData(data) {
        var result = {};
        var lines = data.trim().split('\n');
        
        lines.forEach(function(line) {
            var colonIndex = line.indexOf(':');
            if (colonIndex > 0) {
                var key = line.substring(0, colonIndex).trim();
                var value = line.substring(colonIndex + 1).trim();
                result[key] = value;
            }
        });
        
        return result;
    }

    function getStatusClass(state) {
        if (state && state.toLowerCase().includes('charg')) return 'charging';
        if (state && state.toLowerCase().includes('fully')) return 'fully-charged';
        if (state && state.toLowerCase().includes('discharg')) return 'discharging';
        return '';
    }

    function getPercentageClass(percentage) {
        if (percentage >= 50) return 'success';
        if (percentage >= 20) return 'warning';
        return 'danger';
    }

    function getWidthClass(percentage) {
        // Round to nearest 5%
        var rounded = Math.round(percentage / 5) * 5;
        if (rounded > 100) rounded = 100;
        if (rounded < 0) rounded = 0;
        return 'w-' + rounded;
    }

    function displayBatteryInfo(data) {
        var parsed = parseBatteryData(data);
        var percentage = parseFloat(parsed.percentage) || 0;
        var capacity = parseFloat(parsed.capacity) || 0;
        var state = parsed.state || 'unknown';
        
        var percentageClass = getPercentageClass(percentage);
        var statusClass = getStatusClass(state);
        var widthClass = getWidthClass(percentage);
        
        var html = '<div class="cards-container">';
        
        // Battery Percentage Card
        html += '<div class="card">';
        html += '<div class="card-title">Battery Level</div>';
        html += '<div class="card-value ' + percentageClass + '">' + percentage.toFixed(0) + '%</div>';
        html += '<div class="progress-bar">';
        html += '<div class="progress-fill ' + percentageClass + ' ' + widthClass + '"></div>';
        html += '</div>';
        html += '</div>';
        
        // Status Card
        html += '<div class="card">';
        html += '<div class="card-title">Status</div>';
        html += '<div class="card-label"><span class="status-badge ' + statusClass + '">' + state + '</span></div>';
        if (parsed['energy-rate'] && parseFloat(parsed['energy-rate']) > 0) {
            html += '<div class="card-info">Rate: ' + parsed['energy-rate'] + '</div>';
        }
        html += '</div>';
        
        // Health Card
        html += '<div class="card">';
        html += '<div class="card-title">Battery Health</div>';
        html += '<div class="card-value ' + (capacity >= 70 ? 'success' : capacity >= 50 ? 'warning' : 'danger') + '">' + capacity.toFixed(1) + '%</div>';
        html += '<div class="card-label">Capacity</div>';
        if (parsed['charge-cycles']) {
            html += '<div class="card-info">' + parsed['charge-cycles'] + ' cycles</div>';
        }
        html += '</div>';
        
        // Energy Card
        if (parsed.energy && parsed['energy-full']) {
            html += '<div class="card">';
            html += '<div class="card-title">Energy</div>';
            html += '<div class="card-value">' + parsed.energy + '</div>';
            html += '<div class="card-label">of ' + parsed['energy-full'] + '</div>';
            html += '</div>';
        }
        
        html += '</div>';
        
        // Details Section
        html += '<div class="details-card">';
        html += '<div class="details-title">Battery Details</div>';
        html += '<div class="details-grid">';
        
        var details = [
            { label: 'Vendor', key: 'vendor' },
            { label: 'Model', key: 'model' },
            { label: 'Serial', key: 'serial' },
            { label: 'Technology', key: 'technology' },
            { label: 'Voltage', key: 'voltage' },
            { label: 'Design Capacity', key: 'energy-full-design' },
            { label: 'Full Charge', key: 'energy-full' },
            { label: 'Charge Cycles', key: 'charge-cycles' },
            { label: 'Updated', key: 'updated' }
        ];
        
        details.forEach(function(detail) {
            if (parsed[detail.key]) {
                html += '<div class="detail-item">';
                html += '<div class="detail-label">' + detail.label + '</div>';
                html += '<div class="detail-value">' + parsed[detail.key] + '</div>';
                html += '</div>';
            }
        });
        
        html += '</div>';
        html += '</div>';
        
        document.getElementById('battery-display').innerHTML = html;
    }

    function updateBatteryInfo() {
        var statusDiv = document.getElementById('status');
        statusDiv.className = 'alert alert-info';
        statusDiv.innerHTML = '<div class="alert-icon"><div class="spinner"></div></div>' +
                              '<div class="alert-title">Updating battery information...</div>';
        
        // Call the battery-info.sh script
        cockpit.spawn(["/usr/share/cockpit/battery/battery-info.sh"])
            .done(function(data) {
                statusDiv.className = 'alert alert-success';
                statusDiv.innerHTML = '<div class="alert-icon">✓</div>' +
                                    '<div class="alert-title">Last updated: ' + 
                                    new Date().toLocaleTimeString() + '</div>';
                displayBatteryInfo(data);
            })
            .fail(function(error) {
                statusDiv.className = 'alert alert-danger';
                statusDiv.innerHTML = '<div class="alert-icon">✗</div>' +
                                    '<div class="alert-title">Error: ' + error + '</div>';
            });
    }

    document.addEventListener('DOMContentLoaded', function() {
        updateBatteryInfo();
        setInterval(updateBatteryInfo, 30000);
    });
})();
