async function fetchLeads() {
    try {
        const response = await fetch("http://localhost:8085/api/leads");

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        let stats = {
            allActiveRecords: 0,
            newRecords: 0,
            interested: 0,
            contacted: 0,
            followUp: 0,
            dealClosed: 0,
            lostCall: 0,
            cancelLead: 0,
            notInterested: 0,
            estimatedRev: {
                allActive: 0,
                newRec: 0,
                interested: 0,
                contacted: 0,
                followUp: 0,
                dealClosed: 0,
                cancelLead: 0
            }
        };

        // Calculate lead statistics
        data.forEach(lead => {
            stats.allActiveRecords++;
            stats.estimatedRev.allActive += lead.expectedRevenue;

            switch (lead.leadStage.toLowerCase()) {
                case "interested":
                    stats.interested++;
                    stats.estimatedRev.interested += lead.expectedRevenue;
                    break;
                case "new":
                    stats.newRecords++;
                    stats.estimatedRev.newRec += lead.expectedRevenue;
                    break;
                case "contacted":
                    stats.contacted++;
                    stats.estimatedRev.contacted += lead.expectedRevenue;
                    break;
                case "follow up":
                    stats.followUp++;
                    stats.estimatedRev.followUp += lead.expectedRevenue;
                    break;
                case "deal closed":
                    stats.dealClosed++;
                    stats.estimatedRev.dealClosed += lead.expectedRevenue;
                    break;
                case "cancel lead":
                    stats.cancelLead++;
                    stats.estimatedRev.cancelLead += lead.expectedRevenue;
                    break;
                case "not interested":
                    stats.notInterested++;
                    break;
                default:
                    stats.lostCall++;
                    break;
            }
        });

        // Update DOM with statistics
        const updateElement = (id, value) => document.getElementById(id).textContent = value;

        updateElement('allActiveMyRec', stats.allActiveRecords);
        updateElement('newRecodsMyRec', stats.newRecords);
        updateElement('AllActiveRecordsAllRec', `${stats.allActiveRecords} records`);
        updateElement('interestedRecordsAR', `${stats.interested} records`);
        updateElement('contactedRecordsAL', `${stats.contacted} records`);
        updateElement('FollowUpRecodsAL', `${stats.followUp} records`);
        updateElement('clossedRecordsAL', `${stats.dealClosed} records`);
        updateElement('cancelLeadRecord', `${stats.cancelLead} records`);
        updateElement('notInterestedRecordsAR', `${stats.notInterested} records`);
        updateElement('LostCallRecordsAL', `${stats.lostCall} records`);

        // Update estimated revenue values
        const formatRevenue = (value) => (value / 100000).toFixed(2) + " L";
        updateElement('estimatedpriceAllActive', formatRevenue(stats.estimatedRev.allActive));
        updateElement('estimatedpriceInterested', formatRevenue(stats.estimatedRev.interested));
        updateElement('estimatedpriceContacted', formatRevenue(stats.estimatedRev.contacted));
        updateElement('estimatedpriceFollowUp', formatRevenue(stats.estimatedRev.followUp));
        updateElement('estimatedpriceDealClosed', formatRevenue(stats.estimatedRev.dealClosed));
        updateElement('estimatedpriceCancelLead', formatRevenue(stats.estimatedRev.cancelLead));

        console.log("Fetched Leads Data:", data);
    } catch (error) {
        console.error("Error fetching leads:", error);
    }
}
