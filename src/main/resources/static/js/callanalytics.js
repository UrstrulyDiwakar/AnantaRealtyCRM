
// Constants and Variables
const colors = [
    "#4CAF50", // Green
    "#2196F3", // Blue
    "#FF9800", // Orange
    "#E91E63", // Pink
    "#9C27B0", // Purple
    "#009688", // Teal
    "#FF5722", // Deep Orange
    "#607D8B", // Blue Grey
    "#795548", // Brown
    "#3F51B5"  // Indigo
];
let selectedStartDate = moment().subtract(6, 'days');
let selectedEndDate = moment();
let allCallRecords = [];
let charts = {};
let allUsers = [];

// Initialize the application
$(document).ready(async function () {
    try {
        // Initialize with consistent date range
        selectedStartDate = moment().subtract(30, 'days');
        selectedEndDate = moment();

        // Setup UI elements first
        setupDateRangePicker();
        await populateUsers();

        // Then setup event listeners
        setupEventListeners();

        // Finally load data
        await fetchCallData();

        // Update header with current date range
        updateHeaderDateRange();
    } catch (error) {
        console.error("Initialization error:", error);
    }
});

// Setup Functions
function setupDateRangePicker() {
    $('#dateRange').daterangepicker({
        autoUpdateInput: true,
        startDate: selectedStartDate,
        endDate: selectedEndDate,
        showDropdowns: true,
        alwaysShowCalendars: true,
        locale: { format: 'DD MMM YYYY' },
        ranges: {
            "Today": [moment(), moment()],
            "Yesterday": [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            "Last 7 Days": [moment().subtract(6, 'days'), moment()],
            "Last 30 Days": [moment().subtract(29, 'days'), moment()],
            "This Month": [moment().startOf('month'), moment().endOf('month')],
            "Last Month": [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        }
    }, function (start, end) {
        selectedStartDate = start;
        selectedEndDate = end;
        applyFilters();
    });
}

async function populateUsers() {
    try {
        const response = await fetch('/api/getUsers');
        allUsers = await response.json();
        const usersDropdown = document.getElementById("usersDropdown");

        // Clear existing options except "All Employees"
        const allUsersCheckbox = document.getElementById("selectAllUsers");
        usersDropdown.innerHTML = '';
        usersDropdown.appendChild(allUsersCheckbox.parentElement);

        // Uncheck "All Employees" by default
        allUsersCheckbox.checked = false;

        // Add user checkboxes (unchecked by default)
        allUsers.forEach(user => {
            const username = user.username || user.userid;
            const checkboxId = `user-${username.replace(/\s+/g, '-')}`;

            const checkboxItem = document.createElement("div");
            checkboxItem.className = "checkbox-item";
            checkboxItem.innerHTML = `
                <input type="checkbox" id="${checkboxId}" value="${username}">
                <label for="${checkboxId}">${username}</label>
            `;
            usersDropdown.appendChild(checkboxItem);
        });

        // Initialize selection text
        updateSelectionText();
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

async function fetchCallData() {
    try {
        const response = await fetch('/api/call-records');
        allCallRecords = await response.json();
        applyFilters();
    } catch (error) {
        console.error('Error fetching call records:', error);
    }
}

function setupEventListeners() {
    // Dropdown toggle - add null check
    const dropdownButtons = document.querySelectorAll('.dropdown-btn');
    if (dropdownButtons) {
        dropdownButtons.forEach(button => {
            button.addEventListener('click', function (e) {
                e.stopPropagation();
                const dropdownId = this.id === 'usersDropdownBtn' ? 'usersDropdown' : 'callTypesDropdown';
                const dropdown = document.getElementById(dropdownId);

                document.querySelectorAll('.dropdown-content').forEach(d => {
                    if (d !== dropdown) d.classList.remove('show');
                });

                if (dropdown) dropdown.classList.toggle('show');
            });
        });
    }

    // Prevent dropdown from closing when clicking inside
    const dropdownContents = document.querySelectorAll('.dropdown-content');
    if (dropdownContents) {
        dropdownContents.forEach(dropdown => {
            dropdown.addEventListener('click', function (e) {
                e.stopPropagation();
            });
        });
    }


    // Checkbox changes - add null checks
    const checkboxes = document.querySelectorAll('.checkbox-item input');
    if (checkboxes) {
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function () {
                if (this.id === 'selectAllUsers') {
                    const checkboxes = document.querySelectorAll('#usersDropdown input:not(#selectAllUsers)');
                    if (checkboxes) {
                        checkboxes.forEach(cb => cb.checked = this.checked);
                    }
                } else if (this.id === 'selectAllTypes') {
                    const checkboxes = document.querySelectorAll('#callTypesDropdown input:not(#selectAllTypes)');
                    if (checkboxes) {
                        checkboxes.forEach(cb => cb.checked = this.checked);
                    }
                }
                updateSelectionText();
            });
        });
    }

    // Search button - add null check
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', applyFilters);
    }
}



// Filter Functions
function getSelectedValues(dropdownId, allCheckboxId) {
    const allChecked = document.getElementById(allCheckboxId).checked;
    if (allChecked) return []; // Empty array means "all"

    return Array.from(document.querySelectorAll(`#${dropdownId} input[type="checkbox"]:checked:not(#${allCheckboxId})`))
        .map(checkbox => checkbox.value);
}

function applyFilters() {
    const selectedUsers = getSelectedValues('usersDropdown', 'selectAllUsers');
    const selectedTypes = getSelectedValues('callTypesDropdown', 'selectAllTypes');

    // Get the current date range from the picker
    const dateRange = $('#dateRange').data('daterangepicker');
    const startDate = dateRange?.startDate ? moment(dateRange.startDate) : selectedStartDate;
    const endDate = dateRange?.endDate ? moment(dateRange.endDate) : selectedEndDate;

    let filteredData = allCallRecords.filter(record => {
        // Date filter
        const recordDate = moment(record.startTime);
        if (!recordDate.isBetween(startDate, endDate, 'day', '[]')) {
            return false;
        }

        // Employee filter - check against selected users
        if (selectedUsers.length > 0) {
            const username = record.user.username || record.user.userid;
            if (!selectedUsers.includes(username)) {
                return false;
            }
        }

        // Call type filter
        if (selectedTypes.length > 0 && !selectedTypes.includes(record.callType)) {
            return false;
        }

        return true;
    });

    processDataForCharts(filteredData);
    updateHeaderDateRange();
}

// Data Processing Functions
function processDataForCharts(filteredData) {
    if (!filteredData || filteredData.length === 0) {
        console.warn("No data to display!");
        return;
    }

    const dateRange = $('#dateRange').data('daterangepicker');
    const startDate = dateRange?.startDate ? moment(dateRange.startDate) : selectedStartDate;
    const endDate = dateRange?.endDate ? moment(dateRange.endDate) : selectedEndDate;
    const dayDifference = endDate.diff(startDate, 'days');
    const isSingleDay = dayDifference === 0;
    const isMidRange = dayDifference > 1 && dayDifference <= 7;

    // Initialize duration counters
    let connectedDuration = 0;
    let incomingDuration = 0;
    let outgoingDuration = 0;

    filteredData.forEach(record => {
        if (record.connected && record.durationSeconds) {
            connectedDuration += record.durationSeconds;

            if (record.callType === "INCOMING") {
                incomingDuration += record.durationSeconds;
            } else if (record.callType === "OUTGOING") {
                outgoingDuration += record.durationSeconds;
            }
        }
    });

    const metrics = {
        totalCalls: filteredData.length,
        connectedCalls: filteredData.filter(r => r.connected).length,
        connectedDuration: connectedDuration,
        notConnected: filteredData.filter(r => !r.connected).length,
        uniqueContacts: new Set(filteredData.map(r => r.phoneNumber)).size,
        incomingCalls: filteredData.filter(r => r.callType === "INCOMING").length,
        incomingDuration: incomingDuration,
        outgoingCalls: filteredData.filter(r => r.callType === "OUTGOING").length,
        outgoingDuration: outgoingDuration,
        missedCalls: filteredData.filter(r => r.callType === "MISSED").length,
        rejectedCalls: filteredData.filter(r => r.callType === "REJECTED").length
    };

    updateMetricCards(metrics);

    // Prepare chart data
    const chartData = {
        callsByUser: groupByUser(filteredData),
        callsByTime: isSingleDay ? groupByHour(filteredData) :
            (dayDifference > 7 ? groupByWeek(filteredData) : groupByDate(filteredData)),
        callsDurationByTime: isSingleDay ? groupByHour(filteredData) :
            (dayDifference > 7 ? groupByWeek(filteredData) : calculateDurationsByDate(filteredData)),
        callsByType: {
            incoming: metrics.incomingCalls,
            outgoing: metrics.outgoingCalls,
            missed: metrics.missedCalls,
            rejected: metrics.rejectedCalls
        },
        isWeeklyView: dayDifference > 7,
        isHourlyView: isSingleDay,
        isMidRangeView: isMidRange // Add this flag
    };

    updateCharts(chartData);
}

//Add new groupByHour function
function groupByHour(data) {
    const hourBuckets = {};
    const hourLabels = ['12AM', '3AM', '6AM', '9AM', '12PM', '3PM', '6PM', '9PM'];

    // Initialize buckets with all required properties
    hourLabels.forEach(label => {
        hourBuckets[label.toLowerCase()] = { // Use lowercase for internal consistency
            incoming: 0,
            outgoing: 0,
            missed: 0,
            rejected: 0,
            incomingDuration: 0,
            outgoingDuration: 0
        };
    });

    data.forEach(record => {
        const recordDate = moment(record.startTime);
        const hour = recordDate.hour();

        // Determine which 3-hour bucket this belongs to
        let bucket;
        if (hour >= 0 && hour < 3) bucket = '12am';
        else if (hour >= 3 && hour < 6) bucket = '3am';
        else if (hour >= 6 && hour < 9) bucket = '6am';
        else if (hour >= 9 && hour < 12) bucket = '9am';
        else if (hour >= 12 && hour < 15) bucket = '12pm';
        else if (hour >= 15 && hour < 18) bucket = '3pm';
        else if (hour >= 18 && hour < 21) bucket = '6pm';
        else bucket = '9pm';

        // Safely increment call type count
        if (hourBuckets[bucket]) {
            const callType = record.callType.toLowerCase();
            if (hourBuckets[bucket][callType] !== undefined) {
                hourBuckets[bucket][callType]++;
            }

            // Sum durations for connected calls
            if (record.connected && record.durationSeconds) {
                if (callType === "incoming") {
                    hourBuckets[bucket].incomingDuration += record.durationSeconds;
                } else if (callType === "outgoing") {
                    hourBuckets[bucket].outgoingDuration += record.durationSeconds;
                }
            }
        }
    });

    return hourBuckets;
}

function groupByUser(data) {
    const userMap = {};

    // Count calls per user
    data.forEach(record => {
        const username = record.user.username || record.user.userid;
        userMap[username] = (userMap[username] || 0) + 1;
    });

    // Convert to array and sort by call count (descending)
    const sortedUsers = Object.entries(userMap)
        .sort((a, b) => b[1] - a[1]) // Sort by count descending
        .slice(0, 10); // Take top 10 only

    // Convert back to object format
    const topUsers = {};
    sortedUsers.forEach(([username, count]) => {
        topUsers[username] = count;
    });

    return topUsers;
}

function groupByDate(data) {
    const dateMap = {};
    data.forEach(record => {
        const date = record.startTime.split('T')[0]; // Get YYYY-MM-DD
        dateMap[date] = dateMap[date] || {
            incoming: 0,
            outgoing: 0,
            missed: 0,
            rejected: 0
        };
        dateMap[date][record.callType.toLowerCase()]++;
    });
    return dateMap;
}
function groupByWeek(data) {
    const weeklyData = {};
    const rangeStart = moment(selectedStartDate);
    const rangeEnd = moment(selectedEndDate);

    // First ensure we have all weeks in the range, even if empty
    let currentWeekStart = rangeStart.clone().startOf('isoWeek');
    while (currentWeekStart <= rangeEnd) {
        const weekEnd = currentWeekStart.clone().endOf('isoWeek');
        const weekKey = `${currentWeekStart.format('YYYY-MM-DD')}_${weekEnd.format('YYYY-MM-DD')}`;

        if (!weeklyData[weekKey]) {
            weeklyData[weekKey] = {
                startDate: currentWeekStart.clone(),
                endDate: weekEnd.clone(),
                incoming: 0,
                outgoing: 0,
                missed: 0,
                rejected: 0,
                incomingDuration: 0,
                outgoingDuration: 0
            };
        }
        currentWeekStart.add(1, 'week');
    }

    // Then populate with actual data
    data.forEach(record => {
        const recordDate = moment(record.startTime);
        const weekStart = recordDate.clone().startOf('isoWeek');
        const weekEnd = recordDate.clone().endOf('isoWeek');
        const weekKey = `${weekStart.format('YYYY-MM-DD')}_${weekEnd.format('YYYY-MM-DD')}`;

        if (weeklyData[weekKey]) {
            weeklyData[weekKey][record.callType.toLowerCase()]++;

            if (record.connected && record.durationSeconds) {
                if (record.callType === "INCOMING") {
                    weeklyData[weekKey].incomingDuration += record.durationSeconds;
                } else if (record.callType === "OUTGOING") {
                    weeklyData[weekKey].outgoingDuration += record.durationSeconds;
                }
            }
        }
    });

    // Filter to only include weeks within our date range
    return Object.fromEntries(
        Object.entries(weeklyData).filter(([_, week]) =>
            week.endDate >= rangeStart && week.startDate <= rangeEnd
        )
    );
}

// More robust formatWeekLabel function
function formatWeekLabel(week) {
    // Ensure we're working with Moment.js objects
    const startDate = moment(week.startDate);
    const endDate = moment(week.endDate);

    if (startDate.isSame(endDate, 'day')) {
        return startDate.format('DD MMM YYYY'); // Single day
    }
    if (startDate.month() === endDate.month() && startDate.year() === endDate.year()) {
        return `${startDate.format('DD')}-${endDate.format('DD MMM YYYY')}`;
    }
    return `${startDate.format('DD MMM')}-${endDate.format('DD MMM YYYY')}`;
}




function calculateDurationsByDate(data) {
    const durationMap = {};

    // Initialize all dates in range to ensure they appear
    const dateRange = $('#dateRange').data('daterangepicker');
    const startDate = dateRange?.startDate ? moment(dateRange.startDate) : selectedStartDate;
    const endDate = dateRange?.endDate ? moment(dateRange.endDate) : selectedEndDate;

    // Initialize all dates in the range
    for (let date = startDate.clone(); date <= endDate; date.add(1, 'days')) {
        const dateStr = date.format('YYYY-MM-DD');
        durationMap[dateStr] = {
            incomingDuration: 0,
            outgoingDuration: 0
        };
    }

    // Process actual data
    data.forEach(record => {
        if (!record.connected || record.durationSeconds === null) return;

        const date = record.startTime.split('T')[0];
        if (!durationMap[date]) {
            durationMap[date] = {
                incomingDuration: 0,
                outgoingDuration: 0
            };
        }

        if (record.callType === "INCOMING") {
            durationMap[date].incomingDuration += record.durationSeconds;
        } else if (record.callType === "OUTGOING") {
            durationMap[date].outgoingDuration += record.durationSeconds;
        }
    });

    return durationMap;
}

// Add this helper function to convert seconds to hours/minutes format
function formatDuration(seconds) {
    if (!seconds) return "0s";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    let result = [];
    if (hours > 0) result.push(`${hours}h`);
    if (minutes > 0) result.push(`${minutes}m`);
    if (secs > 0 || result.length === 0) result.push(`${secs}s`);

    return result.join(' ');
}


// UI Update Functions
function updateMetricCards(metrics) {
    // Update counts
    document.querySelector('.metric-card:nth-child(1) strong').textContent = metrics.totalCalls;
    document.querySelector('.metric-card:nth-child(2) strong').textContent = metrics.connectedCalls;
    document.querySelector('.metric-card:nth-child(3) strong').textContent = metrics.notConnected;
    document.querySelector('.metric-card:nth-child(4) strong').textContent = metrics.uniqueContacts;
    document.querySelector('.metric-card:nth-child(5) strong').textContent = metrics.incomingCalls;
    document.querySelector('.metric-card:nth-child(6) strong').textContent = metrics.outgoingCalls;
    document.querySelector('.metric-card:nth-child(7) strong').textContent = metrics.missedCalls;
    document.querySelector('.metric-card:nth-child(8) strong').textContent = metrics.rejectedCalls;

    // Update durations
    document.querySelector('.metric-card:nth-child(2) .duration').textContent = formatDuration(metrics.connectedDuration);
    document.querySelector('.metric-card:nth-child(5) .duration').textContent = formatDuration(metrics.incomingDuration);
    document.querySelector('.metric-card:nth-child(6) .duration').textContent = formatDuration(metrics.outgoingDuration);
}

function updateHeaderDateRange() {
    const dateRange = $('#dateRange').data('daterangepicker');
    const startDate = dateRange?.startDate ? moment(dateRange.startDate) : selectedStartDate;
    const endDate = dateRange?.endDate ? moment(dateRange.endDate) : selectedEndDate;

    $('#date-range').text(
        `${startDate.format('DD MMM YYYY')} to ${endDate.format('DD MMM YYYY')} - Total Days: ${endDate.diff(startDate, 'days') + 1}`
    );
}

function updateCharts(chartData) {
    // Destroy existing charts
    Object.values(charts).forEach(chart => chart?.destroy());

    // Common grid line configuration
    const xAxisGridConfig = {
        drawBorder: true,  // keeps the axis line
        display: false     // hides the grid lines
    };

    const yAxisGridConfig = {
        drawBorder: true,
        display: true      // keeps Y-axis grid lines
    };

    // 1. Calls by User Chart (Top 10 Users)
    const userEntries = Object.entries(chartData.callsByUser)
        .sort((a, b) => b[1] - a[1]) // Sort by call count descending
        .slice(0, 10); // Take top 10 only

    charts.callsByUser = new Chart(
        document.getElementById('callsByUser').getContext('2d'),
        {
            type: 'bar',
            data: {
                labels: userEntries.map(([user]) => user),
                datasets: [{
                    label: 'Total Calls',
                    data: userEntries.map(([_, count]) => count),
                    backgroundColor: colors
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: xAxisGridConfig,
                        title: { display: true, text: 'Number of Calls' }
                    },
                    y: { grid: yAxisGridConfig }
                }
            }
        }
    );

    // Prepare time-based chart data
    let timeLabels, timeData, durationData;
    if (chartData.isHourlyView) {
        // Hourly view (single day selected)
        timeLabels = ['12AM', '3AM', '6AM', '9AM', '12PM', '3PM', '6PM', '9PM'];
        timeData = timeLabels.map(label => chartData.callsByTime[label.toLowerCase()] || {
            incoming: 0, outgoing: 0, missed: 0, rejected: 0
        });
        durationData = timeLabels.map(label => chartData.callsDurationByTime[label.toLowerCase()] || {
            incomingDuration: 0, outgoingDuration: 0
        });
    }
    else if (chartData.isWeeklyView) {
        const allWeeks = Object.values(chartData.callsByTime)
            .sort((a, b) => a.startDate - b.startDate);

        timeLabels = allWeeks.map(week => {
            // Adjust display for partial weeks at month boundaries
            const displayStart = week.startDate.isBefore(selectedStartDate) ?
                moment(selectedStartDate) : week.startDate;
            const displayEnd = week.endDate.isAfter(selectedEndDate) ?
                moment(selectedEndDate) : week.endDate;

            if (displayStart.isSame(displayEnd, 'day')) {
                return displayStart.format('DD MMM YYYY');
            }
            if (displayStart.month() === displayEnd.month()) {
                return `${displayStart.format('DD')}-${displayEnd.format('DD MMM YYYY')}`;
            }
            return `${displayStart.format('DD MMM')}-${displayEnd.format('DD MMM YYYY')}`;
        });

        timeData = allWeeks;
        durationData = allWeeks;
    } else {
        // Daily view
        timeLabels = Object.keys(chartData.callsByTime).sort();
        timeData = timeLabels.map(date => chartData.callsByTime[date] || {
            incoming: 0, outgoing: 0, missed: 0, rejected: 0
        });
        durationData = timeLabels.map(date => chartData.callsDurationByTime[date] || {
            incomingDuration: 0, outgoingDuration: 0
        });
    }

    // 2. Calls by Time Chart
    charts.callsByTime = new Chart(
        document.getElementById('callsByTime').getContext('2d'),
        {
            type: 'bar',
            data: {
                labels: timeLabels,
                datasets: [
                    {
                        label: 'Incoming',
                        data: timeData.map(data => data?.incoming || 0),
                        backgroundColor: '#2196F3'
                    },
                    {
                        label: 'Outgoing',
                        data: timeData.map(data => data?.outgoing || 0),
                        backgroundColor: '#4CAF50'
                    },
                    {
                        label: 'Missed',
                        data: timeData.map(data => data?.missed || 0),
                        backgroundColor: '#feb019d9'
                    },
                    {
                        label: 'Rejected',
                        data: timeData.map(data => data?.rejected || 0),
                        backgroundColor: '#ff4560d9'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: xAxisGridConfig,
                        title: {
                            display: true,
                            text: chartData.isWeeklyView ? 'Week Range' : 'Date'
                        }
                    },
                    y: { grid: yAxisGridConfig }
                }
            }
        }
    );

    // 3. Duration by Time Chart
    charts.callsDurationByTime = new Chart(
        document.getElementById('callsDurationByTime').getContext('2d'),
        {
            type: 'bar',
            data: {
                labels: timeLabels,
                datasets: [
                    {
                        label: 'Incoming Duration',
                        data: durationData.map(data => data?.incomingDuration || 0),
                        backgroundColor: '#2196F3'
                    },
                    {
                        label: 'Outgoing Duration',
                        data: durationData.map(data => data?.outgoingDuration || 0),
                        backgroundColor: '#4CAF50'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        grid: yAxisGridConfig,
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Duration (h m)'
                        },
                        ticks: {
                            callback: function (value) {
                                return formatDuration(value);
                            }
                        }
                    },
                    x: {
                        grid: xAxisGridConfig,
                        title: {
                            display: true,
                            text: chartData.isHourlyView ? 'Time' :
                                (chartData.isWeeklyView ? 'Week Range' : 'Date')
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += formatDuration(context.raw);
                                return label;
                            }
                        }
                    }
                }
            }
        }
    );

    // 4. Calls by Type Chart (unchanged)
    charts.callsByType = new Chart(
        document.getElementById('callsByType').getContext('2d'),
        {
            type: 'bar',
            data: {
                labels: ["Incoming", "Outgoing", "Missed", "Rejected"],
                datasets: [{
                    label: 'Total Calls',
                    data: [
                        chartData.callsByType.incoming,
                        chartData.callsByType.outgoing,
                        chartData.callsByType.missed,
                        chartData.callsByType.rejected
                    ],
                    backgroundColor: ['#2196F3', '#4CAF50', '#feb019d9', '#ff4560d9']
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { grid: xAxisGridConfig },
                    y: { grid: yAxisGridConfig }
                }
            }
        }
    );
}


function updateSelectionText() {
    // Update users selection text
    const userCheckboxes = document.querySelectorAll('#usersDropdown input:not(#selectAllUsers):checked');
    const usersBtnText = document.getElementById('usersBtnText');

    if (userCheckboxes.length === 0) {
        usersBtnText.innerHTML = 'Select Employees';
    } else if (document.getElementById('selectAllUsers').checked) {
        usersBtnText.innerHTML = 'All Employees';
    } else if (userCheckboxes.length === 1) {
        usersBtnText.innerHTML = userCheckboxes[0].nextElementSibling.textContent;
    } else {
        usersBtnText.innerHTML = `${userCheckboxes.length} selected <span class="selected-count">${userCheckboxes.length}</span>`;
    }

    // Update call types selection text
    const typeCheckboxes = document.querySelectorAll('#callTypesDropdown input:not(#selectAllTypes):checked');
    const typesBtnText = document.getElementById('callTypesBtnText');

    if (typeCheckboxes.length === 0) {
        typesBtnText.innerHTML = 'Select Call Types';
    } else if (document.getElementById('selectAllTypes').checked) {
        typesBtnText.innerHTML = 'All Calls';
    } else if (typeCheckboxes.length === 1) {
        typesBtnText.innerHTML = typeCheckboxes[0].nextElementSibling.textContent;
    } else {
        typesBtnText.innerHTML = `${typeCheckboxes.length} selected <span class="selected-count">${typeCheckboxes.length}</span>`;
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const chartContainers = document.querySelectorAll('.card');

    chartContainers.forEach(container => {
        container.addEventListener('mouseenter', function () {
            this.classList.add('active-chart');
        });

        container.addEventListener('mouseleave', function () {
            this.classList.remove('active-chart');
        });
    });
});
