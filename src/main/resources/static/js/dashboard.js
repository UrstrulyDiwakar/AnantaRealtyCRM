let leadsData;

async function fetchLeads() {
    try {
        // Use relative URL to adapt to the server’s host
        const response = await fetch("/api/leads", { credentials: "include" });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        leadsData = data;

        // Initialize counters
        let leadsByOwner = {};
        let leadsByStage = {};
        let leadsBySource = {};
        let closedWon = 0;
        let closedLost = 0;

        let allActiveRecords = 0;
        let newRecords = 0;
        let interested = 0;
        let contacted = 0;
        let followUp = 0;
        let dealClosed = 0;
        let cancelLead = 0;
        let notInterested = 0;

        let estimatedRevAllActive = 0;
        let estimatedRevNewRec = 0;
        let estimatedRevInterested = 0;
        let estimatedRevContacted = 0;
        let estimatedRevFollowUp = 0;
        let estimatedRevDealClosed = 0;
        let estimatedRevCancelLead = 0;
        let estimatedRevNotInterested = 0;

        for (let lead of data) {
            const revenue = lead.expectedRevenue || 0; // Default to 0 if undefined

            switch (lead.leadStage?.toLowerCase()) {
                case "interested":
                    interested++;
                    estimatedRevInterested += revenue;
                    break;
                case "new":
                    newRecords++;
                    estimatedRevNewRec += revenue;
                    break;
                case "contacted":
                    contacted++;
                    estimatedRevContacted += revenue;
                    break;
                case "follow up":
                    followUp++;
                    estimatedRevFollowUp += revenue;
                    break;
                case "deal closed":
                    dealClosed++;
                    estimatedRevDealClosed += revenue;
                    break;
                case "cancel lead":
                    cancelLead++;
                    estimatedRevCancelLead += revenue;
                    break;
                case "not interested":
                    notInterested++;
                    estimatedRevNotInterested += revenue;
                    break;
            }

            // Count active records (exclude closed/canceled)
            if (lead.leadStage !== "cancel lead" && lead.leadStage !== "deal closed") {
                allActiveRecords++;
                estimatedRevAllActive += revenue;
            }
        }

        // Update UI
        document.getElementById('AllActiveRecordsAllRec').textContent = `${allActiveRecords} records`;
        document.getElementById('interestedRecordsAR').textContent = `${interested} records`;
        document.getElementById('contactedRecordsAL').textContent = `${contacted} records`;
        document.getElementById('FollowUpRecodsAL').textContent = `${followUp} records`;
        document.getElementById('clossedRecordsAL').textContent = `${dealClosed} records`;
        document.getElementById('cancelLeadRecord').textContent = `${cancelLead} records`;
        document.getElementById('notInterestedRecordsAR').textContent = `${notInterested} records`;
        document.getElementById('LostCallRecordsAL').textContent = "0 records"; // Not calculated yet

        document.getElementById('estimatedpriceAllActive').textContent = `${(estimatedRevAllActive / 100000).toFixed(2)} L`;
        document.getElementById('estimatedpriceInterested').textContent = `${(estimatedRevInterested / 100000).toFixed(2)} L`;
        document.getElementById('estimatedpriceContacted').textContent = `${(estimatedRevContacted / 100000).toFixed(2)} L`;
        document.getElementById('estimatedpriceFollowUp').textContent = `${(estimatedRevFollowUp / 100000).toFixed(2)} L`;
        document.getElementById('estimatedpriceDealClosed').textContent = `${(estimatedRevDealClosed / 100000).toFixed(2)} L`;
        document.getElementById('estimatedpriceCancelLead').textContent = `${(estimatedRevCancelLead / 100000).toFixed(2)} L`;

        // Follow-up data
        const todayObj = new Date();
        const tomorrowObj = new Date(todayObj);
        tomorrowObj.setDate(todayObj.getDate() + 1);
        const next7daysObj = new Date(todayObj);
        next7daysObj.setDate(todayObj.getDate() + 7);

        const today = formatDate(todayObj);
        const tomorrow = formatDate(tomorrowObj);
        const next7days = formatDate(next7daysObj);

        let allPlannedCount = 0;
        let missedCallsCount = 0;
        let dueTodayCount = 0;
        let overDueCount = 0;
        let dueTomorrowCount = 0;
        let dueNext7daysCount = 0;

        data.forEach(lead => {
            if (!lead.nextFollowUpOn) return;

            const followUpDate = lead.nextFollowUpOn.substring(0, 10).trim();
            allPlannedCount++;

            if (!lead.callMade) {
                missedCallsCount++;
            }

            if (followUpDate === today) {
                dueTodayCount++;
            } else if (followUpDate < today) {
                overDueCount++;
            } else if (followUpDate === tomorrow) {
                dueTomorrowCount++;
            } else if (followUpDate > tomorrow && followUpDate <= next7days) {
                dueNext7daysCount++;
            }
        });

        document.getElementById('allPlannedFS').textContent = allPlannedCount;
        document.getElementById('missedCallsFS').textContent = missedCallsCount;
        document.getElementById('dueTodayFS').textContent = dueTodayCount;
        document.getElementById('overdueLeadsFS').textContent = overDueCount;
        document.getElementById('duetommarowFS').textContent = dueTomorrowCount;
        document.getElementById('dueNext7Dayscount').textContent = dueNext7daysCount;

        // Closed Won/Lost (last 30 days)
        const thirtyDaysAgo = new Date(todayObj);
        thirtyDaysAgo.setDate(todayObj.getDate() - 30);

        closedWon = 0;
        closedLost = 0;
        data.forEach(lead => {
            if (!lead.nextFollowUpOn) return;
            const nextFollowUpDate = new Date(lead.nextFollowUpOn);

            if (nextFollowUpDate >= thirtyDaysAgo && nextFollowUpDate <= todayObj) {
                if (lead.leadStage === "deal closed") {
                    closedWon++;
                } else if (lead.leadStage === "cancel lead" || lead.leadStage === "not interested") {
                    closedLost++;
                }
            }

            // Leads by owner, stage, source
            if (lead.leadOwner?.trim()) {
                leadsByOwner[lead.leadOwner] = (leadsByOwner[lead.leadOwner] || 0) + 1;
            }
            if (lead.leadStage) {
                leadsByStage[lead.leadStage] = (leadsByStage[lead.leadStage] || 0) + 1;
            }
            const leadSource = lead.sourceInfo?.leadSource?.trim() || "Unknown";
            if (leadSource !== "Unknown") {
                leadsBySource[leadSource] = (leadsBySource[leadSource] || 0) + 1;
            }
        });

        const structuredData = {
            leadsByOwner: Object.entries(leadsByOwner).map(([owner, count]) => ({ owner, count })),
            leadsByStage: Object.entries(leadsByStage).map(([stage, count]) => ({ stage, count })),
            leadsBySource: Object.entries(leadsBySource).map(([source, count]) => ({ source, count })),
            closedWon: { count: closedWon },
            closedLost: { count: closedLost }
        };

        console.log("Leads data:", data);
        renderCharts({ ...structuredData, leads: data });
    } catch (error) {
        console.error("Error fetching leads:", error);
        document.getElementById('AllActiveRecordsAllRec').textContent = "Error loading data";
    }
}

async function fetchLeadsOfCurrentUser() {
    try {
        const response = await fetch("/api/leadsUser", { credentials: "include" });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        let allActiveMyRec = 0;
        let newRecords = 0;
        let estimatedRevAllMyRec = 0;
        let estimatedRevNewLeads = 0;

        for (let lead of data) {
            const revenue = lead.expectedRevenue || 0;
            if (["interested", "new", "contacted", "follow up", "not interested"].includes(lead.leadStage?.toLowerCase())) {
                allActiveMyRec++;
                estimatedRevAllMyRec += revenue;
            }
            if (lead.leadStage?.toLowerCase() === "new") {
                newRecords++;
                estimatedRevNewLeads += revenue;
            }
        }

        document.getElementById('allActiveMyRec').textContent = `${allActiveMyRec} records`;
        document.getElementById('newRecodsMyRec').textContent = `${newRecords} records`;
        document.getElementById('estimatedpriceAllActiveMy').textContent = `${(estimatedRevAllMyRec / 100000).toFixed(2)} L`;
        document.getElementById('estimatedpriceAllActiveMyNew').textContent = `${(estimatedRevNewLeads / 100000).toFixed(2)} L`;
    } catch (error) {
        console.error("Error fetching user leads:", error);
        document.getElementById('allActiveMyRec').textContent = "Error loading data";
    }
}

window.onload = async function() {
    console.log("Dashboard JS loaded");
    await Promise.all([fetchLeads(), fetchLeadsOfCurrentUser()]);
};

// Rest of the code (formatDate, renderCharts, and chart functions) remains unchanged
function formatDate(date) {
    return date.getFullYear() + "-" +
        String(date.getMonth() + 1).padStart(2, "0") + "-" +
        String(date.getDate()).padStart(2, "0");
}

function renderCharts(data) {
    createBarChart("leadsByOwnerChart", data.leadsByOwner.map(item => item.owner), data.leadsByOwner.map(item => item.count), "Leads by Owner");
    createFunnelChart("leadsByStageChart", data.leadsByStage);
    createHorizontalBarChart("leadsBySourceChart", data.leadsBySource.map(item => item.source), data.leadsBySource.map(item => item.count), "Leads by Source");
    createPieChart("closedWonChart", { Won: data.closedWon.count });

    const closedLostElement = document.getElementById("closedLostChart");
    if (closedLostElement) closedLostElement.innerText = data.closedLost.count || "No data found";

    createSalesForecastByStageChart("salesForecastByStageChart", data.leads);
    createClosedLostByOwnerChart("closedLostByOwnerChart", data.leads);
}

// Chart functions remain unchanged (omitted for brevity, but keep them as they are)
