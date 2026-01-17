(function() {
    "use strict";

    var cockpit = window.cockpit;
    var lastUpdateTime = null;
    var updateIntervalId = null;

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

    function getWidthClass(percentage) {
        var rounded = Math.round(percentage / 5) * 5;
        if (rounded > 100) rounded = 100;
        if (rounded < 0) rounded = 0;
        return 'w-' + rounded;
    }

    function formatTime(date) {
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();
        var ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;
        return hours + ':' + minutes + ':' + seconds + ' ' + ampm;
    }

    function updateTimeAgo() {
        if (!lastUpdateTime) return;
        
        var now = new Date();
        var diffSeconds = Math.floor((now - lastUpdateTime) / 1000);
        var alertDiv = document.getElementById('alert-area');
        var timeStr = formatTime(lastUpdateTime);
        
        var agoText = diffSeconds === 1 ? '1 second ago' : diffSeconds + ' seconds ago';
        
        alertDiv.innerHTML = '<div class="alert alert-success">' +
                             '<span>Last updated: ' + timeStr + ' (' + agoText + ')</span>' +
                             '</div>';
    }

    function displayBatteryInfo(data) {
        var parsed = parseBatteryData(data);
        var percentage = parseFloat(parsed.percentage) || 0;
        var capacity = parseFloat(parsed.capacity) || 0;
        var state = parsed.state || 'unknown';
        var acOnline = parsed['ac-online'] || 'no';
        
        var statusClass = getStatusClass(state);
        var widthClass = getWidthClass(percentage);
        
        var html = '<div class="cards-grid">';
        
        // Power Status Card
        html += '<div class="card">';
        html += '<div class="card-header">';
        html += '<h2 class="card-title">Power Status</h2>';
        html += '</div>';
        html += '<div class="card-body">';
        html += '<div class="stat-row">';
        html += '<span class="stat-label">Power source</span>';
        if (acOnline === 'yes') {
            html += '<span class="stat-value"><span class="power-source-indicator ac-connected">AC Connected</span></span>';
        } else {
            html += '<span class="stat-value"><span class="power-source-indicator battery-only">Battery</span></span>';
        }
        html += '</div>';
        html += '<div class="stat-row">';
        html += '<span class="stat-label">Status</span>';
        html += '<span class="stat-value"><span class="status-badge ' + statusClass + '">' + state + '</span></span>';
        html += '</div>';
        if (parsed['energy-rate'] && parseFloat(parsed['energy-rate']) > 0) {
            html += '<div class="stat-row">';
            html += '<span class="stat-label">Energy rate</span>';
            html += '<span class="stat-value">' + parsed['energy-rate'] + '</span>';
            html += '</div>';
        }
        html += '</div>';
        html += '</div>';
        
        // Battery Level Card
        html += '<div class="card">';
        html += '<div class="card-header">';
        html += '<h2 class="card-title">Battery Level</h2>';
        html += '</div>';
        html += '<div class="card-body">';
        html += '<div class="stat-row">';
        html += '<span class="stat-label">Charge</span>';
        html += '<span class="stat-value large">' + percentage.toFixed(0) + '%</span>';
        html += '</div>';
        html += '<div class="progress-container">';
        html += '<div class="progress-bar">';
        html += '<div class="progress-fill ' + widthClass + '"></div>';
        html += '</div>';
        html += '</div>';
        html += '</div>';
        html += '</div>';
        
        // Battery Health Card
        html += '<div class="card">';
        html += '<div class="card-header">';
        html += '<h2 class="card-title">Battery Health</h2>';
        html += '</div>';
        html += '<div class="card-body">';
        html += '<div class="stat-row">';
        html += '<span class="stat-label">Capacity</span>';
        html += '<span class="stat-value large">' + capacity.toFixed(1) + '%</span>';
        html += '</div>';
        if (parsed['charge-cycles']) {
            html += '<div class="stat-row">';
            html += '<span class="stat-label">Charge cycles</span>';
            html += '<span class="stat-value">' + parsed['charge-cycles'] + '</span>';
            html += '</div>';
        }
        html += '</div>';
        html += '</div>';
        
        // Energy Card
        if (parsed.energy && parsed['energy-full']) {
            html += '<div class="card">';
            html += '<div class="card-header">';
            html += '<h2 class="card-title">Energy</h2>';
            html += '</div>';
            html += '<div class="card-body">';
            html += '<div class="stat-row">';
            html += '<span class="stat-label">Current</span>';
            html += '<span class="stat-value">' + parsed.energy + '</span>';
            html += '</div>';
            html += '<div class="stat-row">';
            html += '<span class="stat-label">Full charge</span>';
            html += '<span class="stat-value">' + parsed['energy-full'] + '</span>';
            html += '</div>';
            if (parsed['energy-full-design']) {
                html += '<div class="stat-row">';
                html += '<span class="stat-label">Design capacity</span>';
                html += '<span class="stat-value">' + parsed['energy-full-design'] + '</span>';
                html += '</div>';
            }
            html += '</div>';
            html += '</div>';
        }
        
        html += '</div>';
        
        // Battery Information Card (Full Width)
        html += '<div class="card">';
        html += '<div class="card-header">';
        html += '<h2 class="card-title">Battery Information</h2>';
        html += '</div>';
        html += '<div class="card-body">';
        html += '<div class="info-grid">';
        
        var details = [
            { label: 'Vendor', key: 'vendor' },
            { label: 'Model', key: 'model' },
            { label: 'Serial', key: 'serial' },
            { label: 'Technology', key: 'technology' },
            { label: 'Voltage', key: 'voltage' }
        ];
        
        details.forEach(function(detail) {
            if (parsed[detail.key]) {
                html += '<div class="info-item">';
                html += '<span class="info-label">' + detail.label + '</span>';
                html += '<span class="info-value">' + parsed[detail.key] + '</span>';
                html += '</div>';
            }
        });
        
        html += '</div>';
        html += '</div>';
        html += '</div>';
        
        var displayElement = document.getElementById('battery-display');
        displayElement.style.opacity = '0.6';
        displayElement.innerHTML = html;
        setTimeout(function() {
            displayElement.style.opacity = '1';
        }, 100);
    }

    function showAlert(message, type) {
        var alertDiv = document.getElementById('alert-area');
        type = type || 'info';
        
        alertDiv.innerHTML = '<div class="alert alert-' + type + '">' +
                              '<span>' + message + '</span>' +
                              '</div>';
        
        setTimeout(function() {
            alertDiv.innerHTML = '';
        }, 3000);
    }

    function showLastUpdate() {
        lastUpdateTime = new Date();
        updateTimeAgo();
        
        if (updateIntervalId) {
            clearInterval(updateIntervalId);
        }
        
        updateIntervalId = setInterval(updateTimeAgo, 1000);
    }

    function updateBatteryInfo(showLoading) {
        var refreshBtn = document.getElementById('refresh-btn');
        var alertDiv = document.getElementById('alert-area');
        
        if (showLoading !== false) {
            refreshBtn.disabled = true;
            refreshBtn.classList.add('loading');
            
            alertDiv.innerHTML = '<div class="alert alert-info">' +
                                 '<span class="spinner"></span>' +
                                 '<span>Loading battery information...</span>' +
                                 '</div>';
        }
        
        cockpit.spawn(["/usr/share/cockpit/battery/battery-info.sh"])
            .done(function(data) {
                displayBatteryInfo(data);
                showLastUpdate();
                refreshBtn.disabled = false;
                refreshBtn.classList.remove('loading');
            })
            .fail(function(error) {
                alertDiv.innerHTML = '<div class="alert alert-danger">' +
                                     '<span>Failed to load battery information: ' + error + '</span>' +
                                     '</div>';
                refreshBtn.disabled = false;
                refreshBtn.classList.remove('loading');
            });
    }

    document.addEventListener('DOMContentLoaded', function() {
        updateBatteryInfo(true);
        
        document.getElementById('refresh-btn').addEventListener('click', function() {
            updateBatteryInfo(true);
        });
        
        setInterval(function() {
            updateBatteryInfo(false);
        }, 30000);
    });
})();
