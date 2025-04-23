
    // Check if we're in update mode by looking for lead data in URL params
    const urlParams = new URLSearchParams(window.location.search);
    const leadDataParam = urlParams.get('leadData');

    // If leadData exists, we're in update mode
    if (leadDataParam) {
        const leadData = JSON.parse(decodeURIComponent(leadDataParam));
        
        // Proper ways to log the object:
        console.log("in addform - leadData:", leadData);
        console.log("in addform - JSON:", JSON.stringify(leadData, null, 2));
        console.dir(leadData);
        
        populateFormForUpdate(leadData);
    }
    
    // Function to populate form with lead data for update
    function populateFormForUpdate(leadData) {
        document.getElementById('formTitle').textContent = 'Update Lead';
        document.getElementById('leadId').value = leadData.leadId;
        
        // Show update button and hide save buttons
        document.getElementById('update').style.display = 'inline-block';
        document.getElementById('save').style.display = 'none';
        document.getElementById('saveAndNew').style.display = 'none';
        
        // Populate form fields
        document.getElementById('contactName').value = leadData.contactName || '';
        document.getElementById('mobileNumber').value = leadData.mobileNumber || '';
        
        // Handle alternate number
        if (leadData.alternateNumber) {
            document.getElementById('AlterNateNumber').value = leadData.alternateNumber || leadData.alternateNumber;
            document.getElementById('alrernateNumberMain-div').style.display = 'block';
        }
        
        document.getElementById('emailAddress').value = leadData.emailAddress || '';
        document.getElementById('expectedRevenue').value = leadData.expectedRevenue || '';
        
        // Handle leadStage with case-insensitive matching
        const leadStageSelect = document.getElementById('leadStage');
        if (leadData.leadStage) {
            const leadStageLower = leadData.leadStage.toLowerCase();
            for (let i = 0; i < leadStageSelect.options.length; i++) {
                if (leadStageSelect.options[i].value.toLowerCase() === leadStageLower) {
                    leadStageSelect.selectedIndex = i;
                    break;
                }
            }
        }
        
        document.getElementById('nextFollowUpNotes').value = leadData.nextFollowUpNotes || '';
        document.getElementById('description').value = leadData.description || '';
        
		// ==============================================
		// Date/Time Handling Functions
		// ==============================================

		function populateFollowUpDateTime(dateTimeString) {
		    if (!dateTimeString) return;
		    
		    try {
		        const date = new Date(dateTimeString);
		        
		        // Verify elements exist
		        const dateInput = document.getElementById('nextFollowUpOn');
		        const hoursSelect = document.getElementById('followUpHours');
		        const minutesSelect = document.getElementById('followUpMinutes');
		        const ampmSelect = document.getElementById('followUpAmPm');
		        
		        if (!dateInput || !hoursSelect || !minutesSelect || !ampmSelect) {
		            console.error('DateTime elements not found');
		            return;
		        }
		        
		        // Set date (YYYY-MM-DD format)
		        dateInput.value = date.toISOString().split('T')[0];
		        
		        // Set time (12-hour format)
		        let hours = date.getHours();
		        const minutes = date.getMinutes();
		        const ampm = hours >= 12 ? 'PM' : 'AM';
		        hours = hours % 12;
		        hours = hours ? hours : 12; // Convert 0 to 12
		        
		        hoursSelect.value = hours;
		        minutesSelect.value = String(minutes).padStart(2, '0');
		        ampmSelect.value = ampm;
		        
		    } catch (e) {
		        console.error('Error parsing datetime:', e);
		    }
		}
		function getCombinedDateTime() {
		    const dateInput = document.getElementById('nextFollowUpOn').value;
		    const hours = document.getElementById('followUpHours').value;
		    const minutes = document.getElementById('followUpMinutes').value;
		    const ampm = document.getElementById('followUpAmPm').value;
		    
		    if (!dateInput || !hours || !minutes || !ampm) return null;
		    
		    // Convert to 24-hour format
		    let hours24 = parseInt(hours);
		    if (ampm === 'PM' && hours24 < 12) {
		        hours24 += 12;
		    } else if (ampm === 'AM' && hours24 === 12) {
		        hours24 = 0;
		    }
		    
		    return `${dateInput}T${String(hours24).padStart(2, '0')}:${minutes}:00`;
		}

		function formatDateForDisplay(dateString) {
		    if (!dateString) return '--';
		    const date = new Date(dateString);
		    const day = String(date.getDate()).padStart(2, '0');
		    const month = String(date.getMonth() + 1).padStart(2, '0');
		    const year = date.getFullYear();
		    return `${day}-${month}-${year}`;
		}

		function formatDateTimeForDisplay(dateTimeString) {
		    if (!dateTimeString) return '--';
		    
		    const date = new Date(dateTimeString);
		    const day = String(date.getDate()).padStart(2, '0');
		    const month = String(date.getMonth() + 1).padStart(2, '0');
		    const year = date.getFullYear();
		    
		    let hours = date.getHours();
		    const minutes = String(date.getMinutes()).padStart(2, '0');
		    const ampm = hours >= 12 ? 'PM' : 'AM';
		    hours = hours % 12;
		    hours = hours ? hours : 12;
		    
		    return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
		}

		function formatDateForInput(date) {
		    return date.toISOString().split('T')[0];
		}
		
        // Format dates for date inputs

		  // Next Follow-up On
		  if (leadData.nextFollowUpOn) {
		      populateFollowUpDateTime(leadData.nextFollowUpOn);
		  }
        
        // Only set leadDate if it exists in the lead data, otherwise leave it as today's date
        if (leadData.leadDate) {
            const leadDate = new Date(leadData.leadDate);
            document.getElementById('leadDate').value = formatDate(leadDate);
        }
        
        // Lead owner info
        document.getElementById('leadOwnerName').value = leadData.leadOwner || '';
        document.getElementById('leadOwnerEmail').value = leadData.leadOwnerEmail || '';
        
        // Source info with case-insensitive matching for leadSource
        if (leadData.sourceInfo) {
            const leadSourceSelect = document.getElementById('leadSource');
            if (leadData.sourceInfo.leadSource) {
                const leadSourceLower = leadData.sourceInfo.leadSource.toLowerCase();
                for (let i = 0; i < leadSourceSelect.options.length; i++) {
                    if (leadSourceSelect.options[i].value.toLowerCase() === leadSourceLower) {
                        leadSourceSelect.selectedIndex = i;
                        break;
                    }
                }
            }
            
            document.getElementById('campaignTerm').value = leadData.sourceInfo.compaignTeam || '';
            document.getElementById('campaignName').value = leadData.sourceInfo.compaignName || '';
            document.getElementById('campaignContent').value = leadData.sourceInfo.compaignContent || '';
        }
        
        // Created by
        document.getElementById('createdBy').value = leadData.createdBy || '';
    }
	
    
    //displaying alternate mobile 
    function toggleAlternateNumber() {
        let alternateDiv = document.getElementById("alrernateNumberMain-div");
        let alternateInput = document.getElementById("AlterNateNumber");

        // Toggle visibility
        if (alternateDiv.style.display === "none" || alternateDiv.style.display === "") {
            alternateDiv.style.display = "block";
        } else {
            alternateDiv.style.display = "none";
            alternateInput.value = ""; // Clear input when hidden
        }
    }
     
    document.getElementById("AlterNateNumber").addEventListener("blur", function () {
        if (this.value.trim() === "") {
            this.value = ""; // Default value
        }
    });
    
    // Function to fetch data from backend
    async function fetchData() {
        try {
            const response = await fetch('http://localhost:8085/api/leads');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching data:', error);
            return null;
        }
    }

    // Function to populate dropdowns
    function populateDropdown(selectElement, values) {
        selectElement.innerHTML = ''; // Clear existing options
        values.forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            option.text = value;
            selectElement.appendChild(option);
        });
    }

    // Function to populate lead sources dropdown
    function populateLeadSourceDropdown() {
        const leadSourceSelect = document.getElementById("leadSource");
        leadSourceSelect.innerHTML = ''; // Clear existing options

        // Add default option
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.text = "--Select--";
        leadSourceSelect.appendChild(defaultOption);

        // Add lead source options
        const leadSources = [
            "Incoming Call",
            "WhatsApp",
            "Website",
            "Facebook Ad",
            "Google Ad",
            "Indiamart",
            "Tradeindia",
            "Justdial",
            "Sulekha",
            "Paper Ad",
            "Cold Calling",
            "Reference",
            "olx",
            "old data",
            "marketing",
            "event"
        ];

        leadSources.forEach(source => {
            const option = document.createElement("option");
            option.value = source;
            option.text = source;
            leadSourceSelect.appendChild(option);
        });
    }

    // Function to format date as YYYY-MM-DD
    function formatDate(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Function to fetch logged-in username
    async function fetchLoggedInUsername() {
        try {
            const response = await fetch('http://localhost:8085/api/getUsername');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const username = await response.text();
            return username;
        } catch (error) {
            console.error('Error fetching username:', error);
            return 'Unknown User';
        }
    }

    // Function to reset the form and set the createdBy field
    async function resetForm() {
        const form = document.getElementById('addLeadForm');
        form.reset();

        // Set Lead Date to today's date only for new leads (not in update mode)
        if (!leadDataParam) {
            const today = new Date();
            const leadDateInput = document.getElementById('leadDate');
            if (leadDateInput) {
                leadDateInput.value = formatDate(today);
            }
        }

        // Set Created By to the current user's name
        const createdByInput = document.getElementById('createdBy');
        const username = await fetchLoggedInUsername();
        createdByInput.value = username;
    }

    document.addEventListener('DOMContentLoaded', async function () {
        // Fetch data from backend
        const leadsData = await fetchData();

        // Populate lead sources
        populateLeadSourceDropdown();

        // Set Lead Date to today's date only if we're not in update mode
        if (!leadDataParam) {
            const today = new Date();
            const leadDateInput = document.getElementById('leadDate');
            if (leadDateInput) {
                leadDateInput.value = formatDate(today);
            }
        }

        // Set Created By to the current user's name
        const createdByInput = document.getElementById('createdBy');
        const username = await fetchLoggedInUsername();
        console.log(username);
        createdByInput.value = username;
    });
	
	function getCombinedDateTime() {
	    const dateInput = document.getElementById('nextFollowUpOn').value;
	    const hours = document.getElementById('followUpHours').value;
	    const minutes = document.getElementById('followUpMinutes').value;
	    const ampm = document.getElementById('followUpAmPm').value;
	    
	    if (!dateInput || !hours || !minutes || !ampm) return null;
	    
	    // Convert to 24-hour format
	    let hours24 = parseInt(hours);
	    if (ampm === 'PM' && hours24 < 12) {
	        hours24 += 12;
	    } else if (ampm === 'AM' && hours24 === 12) {
	        hours24 = 0;
	    }
	    
	    // Return ISO format string
	    return `${dateInput}T${String(hours24).padStart(2, '0')}:${minutes}:00`;
	}

    document.getElementById('addLeadForm').addEventListener('submit', function (event) {
        event.preventDefault();
        
		const leadData = {
		        contactName: document.getElementById('contactName').value,
		        mobileNumber: document.getElementById('mobileNumber').value,
		        emailAddress: document.getElementById('emailAddress').value,
		        expectedRevenue: parseFloat(document.getElementById('expectedRevenue').value) || null,
		        leadStage: document.getElementById('leadStage').value,
		        nextFollowUpNotes: document.getElementById('nextFollowUpNotes').value,
		        description: document.getElementById('description').value,
		        leadDate: document.getElementById('leadDate').value,
		        leadOwner: document.getElementById('leadOwnerName').value,
		        leadOwnerEmail: document.getElementById('leadOwnerEmail').value,
		        nextFollowUpOn: getCombinedDateTime(), // Use the combined function
		        sourceInfo: {
		            leadSource: document.getElementById('leadSource').value,
		            compaignTeam: document.getElementById('campaignTerm').value,
		            compaignName: document.getElementById('campaignName').value,
		            compaignContent: document.getElementById('campaignContent').value,
		            leadDate: document.getElementById('leadDate').value,
		            createdBy: document.getElementById('createdBy').value
		        }};
        // Include lead ID if we're in update mode
        const leadId = document.getElementById('leadId').value;
        if (leadId) {
            leadData.leadId = leadId;
        }
        
        // If alternateNumber is empty, don't include it in the leadData
        if (leadData.alternateNumber === "") {
            delete leadData.alternateNumber;
        }
        
        const structuredLeadData = {
            ...leadData,
            sourceInfo: sourceInfoData
        };

        console.log(structuredLeadData);

        const submitButton = event.submitter;
        if (submitButton.id === 'saveAndNew') {
            saveAndNewLead(structuredLeadData);
        } else if (submitButton.id === 'save') {
            saveLead(structuredLeadData);
        } else if (submitButton.id === 'update') {
            updateLead(structuredLeadData);
        } else if (submitButton.id === 'cancel') {
            cancelForm();
        }
    });

    // Function to save and reset the form
    async function saveAndNewLead(leadData) {
        try {
            const response = await fetch('http://localhost:8085/api/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(leadData),
            });

            if (response.ok) {
                alert('Lead added successfully!');
                await resetForm();
            } else {
                alert('Failed to add lead: ' + response.statusText);
            }
        } catch (error) {
            console.error('Error adding lead:', error);
            alert('Error adding lead. Please try again.');
        }
    }

    function saveLead(leadData) {
        try {
            fetch('http://localhost:8085/api/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(leadData),
                })
                .then(response => {
                    if (response.ok) {
                        alert('Lead added successfully!');
                        window.location.href = 'leads.html';
                    } else {
                        alert('Failed to add lead: ' + response.statusText);
                    }
                })
                .catch(error => {
                    console.error('Error adding lead:', error);
                    alert('Error adding lead. Please try again.');
                });
        } catch (error) {
            console.error('Error adding lead:', error);
            alert('Error adding lead. Please try again.');
        }
    }
    
    // Function to update an existing lead
    function updateLead(leadData) {
        console.log("before update : " + leadData)
        try {
            fetch('http://localhost:8085/api/update', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(leadData),
                })
                .then(response => {
                    if (response.ok) {
                        alert('Lead updated successfully!');
                        window.location.href = 'leads.html';
                    } else {
                        alert('Failed to update lead: ' + response.statusText);
                    }
                })
                .catch(error => {
                    console.error('Error updating lead:', error);
                    alert('Error updating lead. Please try again.');
                });
        } catch (error) {
            console.error('Error updating lead:', error);
            alert('Error updating lead. Please try again.');
        }
    }

    function cancelForm() {
        const form = document.getElementById('addLeadForm');
        if (form) {
            form.reset();
        }

        // Go back to the previous page
        if (window.history.length > 1) {
            window.history.back();
        } else {
            // If no history, go to the leads page
            window.location.href = 'leads.html';
        }
    }
    
    const EdituserPopUp=document.getElementById("editUserPopUp")
    
    // ✅ Open User Selection Popup
    function openUserPopup() {
        fetch("http://localhost:8085/api/getUsers")
            .then(response => response.json())
            .then(users => {
                const userList = document.getElementById("userList");
                userList.innerHTML = "";
                users.forEach(user => {
                    let row = document.createElement("tr");
                    row.innerHTML = `
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>${user.mobile}</td>
                    <td>${user.profile}</td>
                    <td>${user.reportingTo}</td>
                `;
                row.addEventListener("click", function() {
                    
                    const selectedUser = user;
                    
                    if (selectedUser) {
                        document.getElementById("leadOwnerName").value = selectedUser.username;
                        document.getElementById('leadOwnerEmail').value = selectedUser.email;
                        console.log(selectedUser.username)
                        console.log(selectedUser.email)
                        
                        closeUserPopup(); // Close popup after selection
                    }
                    
                    document.getElementById("userPopup").style.display = "none";
                    });
                    userList.appendChild(row);
                });
                document.getElementById("userPopup").style.display = "flex";
            })
            .catch(error => console.error("Error fetching users:", error));
    }

    // Attach event listeners to buttons
    const openUserPopupBtn = document.getElementById("openUserPopup");
    if (openUserPopupBtn) {
        openUserPopupBtn.addEventListener("click", openUserPopup);
    }

    // Close popup function
    function closeUserPopup() {
        document.getElementById("userPopup").style.display = "none";
    }

    // Attach event listener for closing popup
    const closeUserPopupBtn = document.querySelector(".close-popup");
    if (closeUserPopupBtn) {
        closeUserPopupBtn.addEventListener("click", closeUserPopup);
    }

    // Prevent redirect on refresh
    if (window.history.replaceState) {
        window.history.replaceState(null, null, window.location.pathname);
    }
