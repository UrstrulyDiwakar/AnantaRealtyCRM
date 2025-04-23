import { leadsData, updateLeadsData, setCurrentPage, setRecordsPerPage, } from "./leadsStore.js";

// At the top of your leads.js
sessionStorage.removeItem('leadViewData');

document.addEventListener("DOMContentLoaded", function() {
	console.log("DOM fully loaded and parsed");

	/* ********************************MASS EDIT*************************************************  */

	// Unified function to handle mass edit (actually single lead edit)
	window.handleMassEdit = function(e) {
		if (e) e.preventDefault();

		console.log("Mass edit clicked"); // Debug check

		const selectedLeads = getSelectedLeads();
		if (!selectedLeads || selectedLeads.length === 0) {
			alert("Please select at least one lead to edit.");
			return;
		}

		if (selectedLeads.length === 1) {
			// Single lead edit - redirect to edit page
			const leadToEdit = selectedLeads[0];
			// Ensure we're using the correct property name (leadId vs id)
			leadToEdit.id = leadToEdit.leadId || leadToEdit.id;
			window.location.href = `addLead.html?leadData=${encodeURIComponent(JSON.stringify(leadToEdit))}`;
		} else {
			// Multiple leads selected - show mass edit popup
			showMassEditPopup(selectedLeads);
		}
	};

	// New function to handle the mass edit popup display
	function showMassEditPopup(selectedLeads) {
		console.log("Showing mass edit for", selectedLeads.length, "leads");

		// Show the popup
		const popup = document.getElementById('massEditOverlay');
		popup.style.display = 'flex';

		// Update the popup title with count
		document.querySelector('.popup-header h2').textContent =
			`Mass Edit (${selectedLeads.length} Leads Selected)`;

		// Store selected lead IDs for form submission
		popup.dataset.selectedLeadIds = JSON.stringify(selectedLeads.map(lead => lead.leadId || lead.id));

		// Reset form fields and checkboxes
		const form = popup.querySelector('.mainbuttonpanel');
		const inputs = form.querySelectorAll('input, select');
		inputs.forEach(input => {
			if (input.type === 'checkbox') {
				input.checked = false; // Uncheck all checkboxes
			} else if (input.type !== 'button' && input.type !== 'submit') {
				input.value = '';
				if (input.tagName === 'SELECT') {
					input.selectedIndex = 0; // Reset to first option
				}
			}
		});

		// Set default lead stage to "NEW" if available
		const leadStageSelect = form.querySelector('select[name="leadStage"]');
		if (leadStageSelect) leadStageSelect.value = 'NEW';
	}

	// Add event listener for cancel button
	document.querySelector('.cancel-button').addEventListener('click', function() {
		document.getElementById('massEditOverlay').style.display = 'none';
	});

	document.querySelector('.save-button').addEventListener('click', async function() {
		const popup = document.getElementById('massEditOverlay');
		const selectedLeadIds = JSON.parse(popup.dataset.selectedLeadIds || '[]');
		const selectedLeads = getSelectedLeads(); // Make sure this returns the full lead objects

		if (selectedLeads.length === 0) {
			alert("No leads selected for editing.");
			return;
		}

		// Get all checked fields and their values
		const changes = {};
		const checkboxes = document.querySelectorAll('.field-checkbox:checked');

		if (checkboxes.length === 0) {
			alert("Please select at least one field to update by checking the checkboxes.");
			return;
		}

		checkboxes.forEach(checkbox => {
			const fieldName = checkbox.dataset.field;
			const formGroup = checkbox.closest('.form-group');

			switch (fieldName) {
				case 'leadOwner':
					if (document.getElementById('leadOwnerName').value) {
						changes.leadOwner = document.getElementById('leadOwnerName').value;
						changes.leadOwnerEmail = document.getElementById('leadOwnerEmail').value;
					}
					break;

				case 'leadStage':
					changes.leadStage = formGroup.querySelector('select').value;
					break;

				case 'expectedRevenue':
					changes.expectedRevenue = formGroup.querySelector('input[type="text"]').value;
					break;

				case 'expectedClosingDate':
					changes.expectedClosingDate = formGroup.querySelector('input[type="date"]').value;
					break;

				case 'leadSource':
					changes.leadSource = formGroup.querySelector('select').value;
					break;

				// 1. First fix the field name in your switch case
				case 'nextFollowUp':
					const nextFollowUpFormGroup = checkbox.closest('.form-group'); // Changed variable name
					const dateInput = nextFollowUpFormGroup.querySelector('input[type="date"]');
					const timeContainer = nextFollowUpFormGroup.querySelector('.time-input-container');

					if (!timeContainer) {
						console.error('Time container not found');
						break;
					}

					// Get all time selects reliably
					const timeSelects = timeContainer.querySelectorAll('select.time-input');
					if (timeSelects.length < 3) {
						console.error('Time inputs not found');
						break;
					}

					const hoursSelect = timeSelects[0];
					const minutesSelect = timeSelects[1];
					const ampmSelect = timeSelects[2];

					if (dateInput?.value && hoursSelect?.value && minutesSelect?.value && ampmSelect?.value) {
						// Convert 12-hour to 24-hour format
						let hours24 = parseInt(hoursSelect.value);
						if (ampmSelect.value === 'PM' && hours24 < 12) {
							hours24 += 12;
						} else if (ampmSelect.value === 'AM' && hours24 === 12) {
							hours24 = 0;
						}

						// Create properly formatted datetime string
						changes.nextFollowUpOn = `${dateInput.value}T${String(hours24).padStart(2, '0')}:${minutesSelect.value.padStart(2, '0')}`;
					}
					break;


				case 'dealNoOfCents':
					changes.dealNoOfCents = formGroup.querySelector('input[type="number"]').value;
					break;

				case 'dealTotalValue':
					changes.dealTotalValue = formGroup.querySelector('input[type="number"]').value;
					break;

				case 'category':
					changes.category = formGroup.querySelector('select').value;
					break;
			}
		});

		// Filter out empty values
		Object.keys(changes).forEach(key => {
			if (changes[key] === undefined || changes[key] === '' || changes[key] === null) {
				delete changes[key];
			}
		});

		if (Object.keys(changes).length === 0) {
			alert("No valid changes detected. Please check your inputs.");
			return;
		}
		// Filter out empty values
		Object.keys(changes).forEach(key => {
			if (changes[key] === undefined ||
				changes[key] === '' ||
				changes[key] === null ||
				(key === 'nextFollowUpOn' && !isValidDateTime(changes[key]))) {
				delete changes[key];
			}
		});

		// Helper function to validate datetime
		function isValidDateTime(dateTimeString) {
			if (!dateTimeString) return false;
			return !isNaN(Date.parse(dateTimeString));
		}
		// Create update payload - include ALL fields but only update changed ones
		const updates = selectedLeads.map(lead => {
			const update = {
				leadId: lead.leadId,
				// Preserve all existing values
				...lead,
				// Only override changed fields
				...(changes.leadStage && { leadStage: changes.leadStage }),
				...(changes.leadOwner && { leadOwner: changes.leadOwner }),
				...(changes.leadOwnerEmail && { leadOwnerEmail: changes.leadOwnerEmail }),
				...(changes.category && { category: changes.category }),
				...(changes.expectedClosingDate && { expectedClosingDate: changes.expectedClosingDate }),
				...(changes.expectedRevenue && { expectedRevenue: changes.expectedRevenue }),
				// CHANGED FROM nextFollowUp to nextFollowUpOn
				...(changes.nextFollowUpOn && { nextFollowUpOn: changes.nextFollowUpOn }),
				// Add all other fields similarly...

				// Handle nested objects
				sourceInfo: {
					...lead.sourceInfo,
					...(changes.leadSource && { leadSource: changes.leadSource })
				},
				wonInfo: {
					...(lead.wonInfo || {}), // Handle case where wonInfo might be null
					...(changes.dealNoOfCents && { dealNoOfCents: changes.dealNoOfCents }),
					...(changes.dealTotalValue && { dealTotalValue: changes.dealTotalValue })
				}
			};

			return update;
		});

		console.log("Sending to backend:", updates);

		try {
			const response = await fetch('http://localhost:8085/api/bulk-update', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(updates)
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || `HTTP error ${response.status}`);
				fetchLeads(); // Refresh leads after update
			}

			const result = await response.json();
			console.log('Bulk update successful:', result);
			alert(`Successfully updated ${updates.length} leads!`);
			popup.style.display = 'none';
			// Implement this function to refresh your UI

		} catch (error) {
			console.error('Update failed:', error);
			alert(`Update failed: ${error.message}`);
		}
	});


	// Open User Selection Popup
	function openUserPopup() {
		console.log("Opening user selection popup");
		fetch("http://localhost:8085/api/getUsers")
			.then(response => response.json())
			.then(users => {
				const userList = document.getElementById("userList");
				userList.innerHTML = "";

				users.forEach(user => {
					const row = document.createElement("tr");
					row.innerHTML = `
	                    <td>${user.username || 'N/A'}</td>
	                    <td>${user.email || 'N/A'}</td>
	                    <td>${user.mobile || 'N/A'}</td>
	                    <td>${user.profile || 'N/A'}</td>
	                    <td>${user.reportingTo || 'N/A'}</td>
	                `;
					row.addEventListener("click", function() {
						document.getElementById("leadOwnerName").value = user.username || '';
						document.getElementById("leadOwnerEmail").value = user.email || '';
						closeUserPopup();
					});
					userList.appendChild(row);
				});

				document.getElementById("userPopup").style.display = "flex";
			})
			.catch(error => {
				console.error("Error fetching users:", error);
				alert("Failed to load users. Please try again.");
			});
	}

	// Close User Popup
	function closeUserPopup() {
		document.getElementById("userPopup").style.display = "none";
	}

	// Event listener for the lead owner icon
	document.querySelector(".lead-owner-icon").addEventListener("click", openUserPopup);

	/* *****************************END MASS EDIT******************************** */


	document.getElementById("recordsPerPage").addEventListener("change", function() {
		const selectedValue = this.value;

		// When selecting "all", we don't need pagination
		if (selectedValue === "all") {
			setRecordsPerPage("all");
			setCurrentPage(1);
		} else {
			const selectedRecordsPerPage = parseInt(selectedValue) || 50;
			setRecordsPerPage(selectedRecordsPerPage);
			setCurrentPage(1);
		}

		renderLeads();
	});

	// Load saved state from localStorage (if any)
	const savedState = localStorage.getItem('leadsState');
	if (savedState) {
		const state = JSON.parse(savedState);
		setRecordsPerPage(state.recordsPerPage || leadsData.recordsPerPage);
		setCurrentPage(state.currentPage || leadsData.currentPage);
	}
	//function to fetch leads from backend
	async function fetchLeads(selectedFilter = "All Active Leads") {
		try {
			console.log("Fetching leads with filter:", selectedFilter);

			// Show loading indicator
			const tableBody = document.getElementById("leads-table-body");
			if (tableBody) {
				tableBody.innerHTML = `
	                <tr>
	                    <td colspan="9" class="loading-indicator">
	                        <div class="spinner"></div>
	                        <span>Loading leads...</span>
	                    </td>
	                </tr>
	            `;
			}

			const apiUrl = selectedFilter !== "All Active Leads"
				? `http://localhost:8085/api/leads?filter=${encodeURIComponent(selectedFilter)}`
				: "http://localhost:8085/api/leads";

			const response = await fetch(apiUrl);
			if (!response.ok) throw new Error(`HTTP ${response.status}`);

			const fetchedLeads = await response.json();
			console.log("Received", fetchedLeads.length, "leads");

			// Ensure we got an array
			if (!Array.isArray(fetchedLeads)) {
				throw new Error("Invalid data format received from API");
			}

			updateLeadsData(fetchedLeads);
			applyFilters(selectedFilter);

		} catch (error) {
			console.error("Failed to fetch leads:", error);
			// Maintain valid state even on error
			leadsData.filteredLeads = [];
			updatePaginationControls();
			renderLeads();
		}
	}
	// finter the leads according to dropdown 
	const filterFunctions = {
		"All Active Leads": (lead) => lead.leadStage.toLowerCase() !== "deal closed" && lead.leadStage.toLowerCase() !== "cancel lead",
		"New Leads": (lead) => lead.leadStage.toLowerCase() === "new",
		"Contacted Leads": (lead) => lead.leadStage.toLowerCase() === "contacted",
		"Followup Leads": (lead) => lead.leadStage.toLowerCase() === "follow-up" || lead.leadStage.toLowerCase() === "follow up",
		"Interested Leads": (lead) => lead.leadStage.toLowerCase() === "interested",
		"Next 30 Days Closures": (lead) => lead.nextFollowUpOn && new Date(lead.nextFollowUpOn) >= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
		"Last 30 Days Deal Closed Leads": (lead) => lead.leadStage.toLowerCase() === "deal closed" && new Date(lead.leadDate) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
		"Last 30 Days Lost Leads": (lead) => lead.leadStage.toLowerCase() === "cancel lead" && new Date(lead.leadDate) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
		"All Deal Closed Leads": (lead) => lead.leadStage.toLowerCase() === "deal closed",
		"All Cancel Deal Leads": (lead) => lead.leadStage.toLowerCase() === "cancel lead",
		"All Planned Follow-up": (lead) => lead.nextFollowUpOn != null && lead.nextFollowUpOn != undefined && lead.leadStage.toLowerCase() === "follow-up",
		"Due Today Follow-up": (lead) => lead.nextFollowUpOn && isSameDate(new Date(lead.nextFollowUpOn), new Date()) && lead.leadStage.toLowerCase() === "follow-up",
		"Due Tomorrow Follow-up": (lead) => lead.nextFollowUpOn && isSameDate(new Date(lead.nextFollowUpOn), tomorrow()) && lead.leadStage.toLowerCase() === "follow-up",
		"Due Next 7 Days Follow-up": (lead) => lead.nextFollowUpOn && isWithinNext7Days(new Date(lead.nextFollowUpOn)) && lead.leadStage.toLowerCase() === "follow-up",
		"NOT INTERESTED": (lead) => lead.leadStage.toLowerCase() === "not interested",

	};

	// Function to get paginated leads - MOVED TO TOP
	function getPaginatedLeads(leads, page, recordsPerPage) {
		// If "all" is selected, return all leads
		if (recordsPerPage === "all") {
			return leads;
		}

		// Ensure valid numbers for pagination
		const perPage = parseInt(recordsPerPage) || 50;
		const currentPage = parseInt(page) || 1;

		const startIndex = (currentPage - 1) * perPage;
		const endIndex = startIndex + perPage;
		return leads.slice(startIndex, endIndex);
	}
	//function to check weather the given dates are same or not.
	function isSameDate(date1, date2) {
		return date1.getFullYear() === date2.getFullYear() &&
			date1.getMonth() === date2.getMonth() &&
			date1.getDate() === date2.getDate();
	}
	// check the tomorrow
	function tomorrow() {
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		return tomorrow;
	}
	//funtion find the next 7th day date
	function isWithinNext7Days(date) {
		const today = new Date();
		const nextWeek = new Date();
		nextWeek.setDate(today.getDate() + 7);
		return date >= today && date <= nextWeek;
	}

	//filter the leads based on the dwopdown selection
	async function applyFilters(selectedFilter) {
		const dropdown = document.getElementById("leadFilterDropdown");
		selectedFilter = selectedFilter || dropdown.value;

		localStorage.setItem("selectedFilter", selectedFilter);

		let filtered = [...leadsData.allLeads]; //start with ALL leads...
		if (selectedFilter && filterFunctions[selectedFilter]) {
			filtered = leadsData.allLeads.filter(filterFunctions[selectedFilter]);
		}

		if (selectedFilter === "Overdue Follow-up") {
			filtered = filtered.filter(lead => lead.nextFollowUpOn && new Date(lead.nextFollowUpOn) < new Date() && lead.leadStage === "Follow-up".toLowerCase());
		}

		leadsData.filteredLeads = filtered;
		console.log("Filtered Leads:", leadsData.filteredLeads);
		renderLeads();
	}

	// Apply filters based on dropdown selection
	document.getElementById("leadFilterDropdown").addEventListener("change", function() {
		applyFilters();
	});

	// Add refresh button event listener
	document.getElementById("refreshButton").addEventListener("click", refreshLeads);

	function refreshLeads() {
		const selectedFilter = document.getElementById("leadFilterDropdown").value;
		fetchLeads(selectedFilter); // Re-fetch with the currently selected filter
	}



	// Add event listener to the "Select All" checkbox
	const selectAllCheckbox = document.getElementById("selectAllCheckbox");
	if (selectAllCheckbox) {
		selectAllCheckbox.addEventListener("change", function() {
			const isChecked = this.checked;
			const leadCheckboxes = document.querySelectorAll(".lead-checkbox");

			// Select/deselect all checkboxes on the current page
			leadCheckboxes.forEach(checkbox => {
				checkbox.checked = isChecked;
			});
		});
	}

	// Add event listener to individual checkboxes to uncheck "Select All" if any checkbox is unchecked
	const tableBody = document.getElementById("leads-table-body");
	if (tableBody) {
		tableBody.addEventListener("change", function(event) {
			if (event.target.classList.contains("lead-checkbox")) {
				const allChecked = document.querySelectorAll(".lead-checkbox:checked").length === document.querySelectorAll(".lead-checkbox").length;
				selectAllCheckbox.checked = allChecked;
			}
		});
	}


	// Function to delete selected leads
	//to delete the records in table
	document.getElementById("deleteLeadsBtn").addEventListener("click", deleteSelectedLeads);


	async function deleteSelectedLeads() {
		const leadCheckboxes = document.querySelectorAll(".lead-checkbox:checked");
		const leadIdsToDelete = Array.from(leadCheckboxes).map(checkbox => checkbox.dataset.leadId);

		if (leadIdsToDelete.length === 0) {
			alert("Please select leads to delete.");
			return;
		}

		if (confirm(`Are you sure you want to delete ${leadIdsToDelete.length} leads?`)) {
			try {
				const response = await fetch("http://localhost:8085/api/delete", {
					method: "DELETE",
					headers: {
						"Content-Type": "application/json"
					},
					body: JSON.stringify(leadIdsToDelete) // Directly send the array of leadIds
				});

				if (!response.ok) {
					throw new Error(`HTTP error! Status: ${response.status}`);
				}

				console.log("Leads deleted successfully.");
				fetchLeads(); // Refresh leads after deletion
			} catch (error) {
				console.error("Error deleting leads:", error);
				alert("Failed to delete leads. Please try again.");
			}
		}
	}


	//render the leads (display the leads)
	//render the leads (display the leads)
	function renderLeads() {
		logRenderState();

		const tableBody = document.getElementById("leads-table-body");
		if (!tableBody) return;

		// Don't clear the table body here if we want to keep showing loading indicator
		// during fetch (it's already set in fetchLeads)

		const paginatedLeads = getPaginatedLeads(
			leadsData.filteredLeads,
			leadsData.currentPage,
			leadsData.recordsPerPage
		);

		console.log(`Rendering ${paginatedLeads.length} leads (Page ${leadsData.currentPage})`);

		if (paginatedLeads.length === 0) {
			tableBody.innerHTML = "<tr><td colspan='9'>No records found.</td></tr>";
		} else {
			tableBody.innerHTML = ""; // Now clear the loading indicator

			paginatedLeads.forEach((lead, index) => {
				const row = document.createElement("tr");
				row.style.cursor = "pointer";
				row.dataset.leadId = lead.leadId;

				// Calculate absolute index in filtered leads
				const absoluteIndex = (leadsData.currentPage - 1) * leadsData.recordsPerPage + index;
				row.dataset.leadIndex = absoluteIndex;

				// Format the date and time
				let formattedDateTime = '-';
				if (lead.nextFollowUpOn) {
					const dateObj = new Date(lead.nextFollowUpOn);

					// Format date as DD-MM-YYYY
					const day = String(dateObj.getDate()).padStart(2, '0');
					const month = String(dateObj.getMonth() + 1).padStart(2, '0');
					const year = dateObj.getFullYear();
					const formattedDate = `${day}-${month}-${year}`;

					// Format time as 12-hour with AM/PM
					let hours = dateObj.getHours();
					const ampm = hours >= 12 ? 'PM' : 'AM';
					hours = hours % 12;
					hours = hours ? hours : 12; // Convert 0 to 12
					const minutes = String(dateObj.getMinutes()).padStart(2, '0');
					const formattedTime = `${hours}:${minutes} ${ampm}`;

					// Combine with space between date and time
					formattedDateTime = `${formattedDate} &nbsp; ${formattedTime}`;
				}

				row.innerHTML = `
	                <td><input type="checkbox" class="lead-checkbox" data-lead-id="${lead.leadId}"></td>
	                <td>${lead.leadOwner || '-'}</td>
	                <td>${lead.leadDate || '--'}</td>
	                <td>${lead.contactName || '-'}</td>
	                <td>${lead.mobileNumber || '-'}</td>
	                <td class="status">${lead.leadStage || ''}</td>
	                <td>${lead.expectedRevenue || ''}</td>
	                <td>${formattedDateTime}</td>
	                <td>${lead.nextFollowUpNotes || ''}</td>
	            `;

				// Add click event to open lead view
				row.addEventListener("click", function(event) {
					// Check if the click target is or is inside a checkbox element
					const isCheckboxClick = event.target.matches('.lead-checkbox') ||
						event.target.closest('.lead-checkbox');

					// Only open lead view if the click wasn't on the checkbox
					if (!isCheckboxClick) {
						openLeadView(lead.leadId, absoluteIndex);
					}
				});

				tableBody.appendChild(row);
			});
		}

		updatePaginationControls();
	}

	// Function to open lead view
	function openLeadView(leadId, leadIndex) {
		// Store the current leads and index in sessionStorage
		const viewData = {
			currentIndex: leadIndex,
			leads: leadsData.filteredLeads,
			filter: document.getElementById("leadFilterDropdown").value
		};

		sessionStorage.setItem('leadViewData', JSON.stringify(viewData));
		window.location.href = `viewlead.html?leadId=${leadId}`;
	}

	//funtion to filter records based on records per page
	function updatePaginationControls() {
		const recordsPerPage = leadsData.recordsPerPage;
		const filteredCount = leadsData.filteredLeads?.length || 0;
		const currentPage = parseInt(leadsData.currentPage) || 1;
		const pageInfoElement = document.getElementById("pageInfo");

		// Handle "all" records case
		if (recordsPerPage === "all") {
			pageInfoElement.textContent = `Showing all ${filteredCount} records`;
			document.getElementById("prevPage").disabled = true;
			document.getElementById("nextPage").disabled = true;
			return;
		}

		// Normal pagination case
		const perPage = parseInt(recordsPerPage) || 50;
		const totalPages = Math.max(1, Math.ceil(filteredCount / perPage));
		const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);

		// Update state if needed
		if (currentPage !== safeCurrentPage) {
			setCurrentPage(safeCurrentPage);
		}

		// Update UI
		pageInfoElement.textContent = `Page ${safeCurrentPage} of ${totalPages}`;
		document.getElementById("prevPage").disabled = safeCurrentPage <= 1;
		document.getElementById("nextPage").disabled = safeCurrentPage >= totalPages || filteredCount === 0;
	}
	// Only set up leads.js pagination if not already set up by leads2.js
	if (typeof window.toggleSearch === 'undefined') {
		document.getElementById("prevPage").addEventListener("click", function() {
			if (leadsData.currentPage > 1) {
				setCurrentPage(leadsData.currentPage - 1);
				renderLeads();
			}
		});

		document.getElementById("nextPage").addEventListener("click", function() {
			if (leadsData.currentPage * leadsData.recordsPerPage < leadsData.filteredLeads.length) {
				setCurrentPage(leadsData.currentPage + 1);
				renderLeads();
			}
		});
	}



	// Records Per Page Dropdown
	document.getElementById("recordsPerPage").addEventListener("change", function() {
		const selectedValue = this.value;
		setRecordsPerPage(selectedValue);
		setCurrentPage(1); // Always reset to first page when changing page size
		renderLeads();
	});


	// -------------------------------------------------------------------------
	// EXPORT FUNCTIONALITY
	// -------------------------------------------------------------------------


	window.exportData = function() {
		const exportOption = document.querySelector('input[name="exportOption"]:checked');
		const fromRecord = parseInt(document.getElementById('fromRecord').value, 10) || 1;
		let toRecord = parseInt(document.getElementById('toRecord').value, 10) || 500;

		if (!exportOption) {
			alert("Please select an export option.");
			return;
		}

		// Validate range
		if (fromRecord > toRecord) {
			alert("'From' record number must be less than or equal to 'To' record number.");
			return;
		}

		const exportType = exportOption.value;
		console.log("Selected Export Type:", exportType);
		let leadsToExport = [];
		//check weather which function user wants to export.
		switch (exportType) {
			case "currentPage":
				const startIndex = (leadsData.currentPage - 1) * leadsData.recordsPerPage;
				const endIndex = Math.min(startIndex + leadsData.recordsPerPage, leadsData.filteredLeads.length);
				leadsToExport = leadsData.filteredLeads.slice(startIndex, endIndex);

				// Apply range to current page results
				const pageFrom = Math.max(fromRecord - 1 - startIndex, 0);
				const pageTo = Math.min(toRecord - startIndex, leadsToExport.length);
				leadsToExport = leadsToExport.slice(pageFrom, pageTo);
				console.log("Current Page Leads:", leadsToExport);
				break;

			case "searchRecords":
				if (!leadsData.searchfilteredLeads || leadsData.searchfilteredLeads.length === 0) {
					alert("No search results found. Please perform a search first.");
					return;
				}
				// Ensure toRecord doesn't exceed available records
				toRecord = Math.min(toRecord, leadsData.searchfilteredLeads.length);
				leadsToExport = leadsData.searchfilteredLeads.slice(fromRecord - 1, toRecord);
				console.log("Search Records Leads:", leadsToExport);
				break;

			case "allColumnRecords":
				// Ensure toRecord doesn't exceed available records
				toRecord = Math.min(toRecord, leadsData.allLeads.length);
				leadsToExport = leadsData.allLeads.slice(fromRecord - 1, toRecord);
				console.log("All Leads (All Columns):", leadsToExport);
				break;

			case "selectedRecords":
				leadsToExport = getSelectedLeads();
				if (leadsToExport.length === 0) {
					alert("Please select leads to export.");
					return;
				}
				// Apply range to selected records
				toRecord = Math.min(toRecord, leadsToExport.length);
				leadsToExport = leadsToExport.slice(fromRecord - 1, toRecord);
				console.log("Selected Leads:", leadsToExport);
				break;

			default:
				alert("Invalid export option.");
				return;
		}

		if (leadsToExport.length > 0) {
			downloadCSV(leadsToExport, exportType);
		} else {
			alert("No records available for export in the specified range.");
		}

		closePopup();
	};


	// Function to get selected leads
	function getSelectedLeads() {
		// Fetch all checked checkboxes
		const leadCheckboxes = document.querySelectorAll(".lead-checkbox:checked");

		// Map the checked checkboxes to their corresponding lead IDs
		const leadIdsToExport = Array.from(leadCheckboxes).map((checkbox) => checkbox.dataset.leadId);

		// Find the corresponding lead objects in `leadsData.allLeads`
		const selectedLeads = leadsData.allLeads.filter((lead) => leadIdsToExport.includes(String(lead.leadId)));

		console.log("Selected Leads:", selectedLeads); // Debugging
		return selectedLeads;
	}


	function downloadCSV(leads, exportType) {
		console.log("Leads to Export:", leads); // Debugging
		console.log("Export Type:", exportType); // Debugging

		let csvHeaders = [];
		let csvRows = [];

		if (leads.length > 0) {
			if (exportType === "allColumnRecords") {
				// Include all fields from both lead and sourceInfo tables (except IDs)
				csvHeaders = [
					"contactName",
					"description",
					"emailAddress",
					"expectedRevenue",
					"leadDate",
					"leadOwner",
					"leadOwnerEmail",
					"leadStage",
					"mobile_number",
					"nextFollowUpNotes",
					"nextFollowUpOn",
					// Add sourceInfo fields here
					"leadSource",
					"campaignName",
					"campaignTeam",
					"campaignContent"
				];
			} else {
				// Include only specific fields from lead table
				csvHeaders = [
					"contactName",
					"mobile_number",
					"leadOwner",
					"leadDate",
					"leadStage",
					"expectedRevenue",
					"nextFollowUpOn",
					"nextFollowUpNotes"
				];
			}

			// Prepare rows by flattening sourceInfo fields into each lead object
			leads.forEach((lead) => {
				let row = csvHeaders.map((header) => {
					if (header in lead) {
						return typeof lead[header] === 'string' ? `"${lead[header].replace(/"/g, '""')}"` : lead[header];
					} else if (lead.sourceInfo && header in lead.sourceInfo) {
						return typeof lead.sourceInfo[header] === 'string' ? `"${lead.sourceInfo[header].replace(/"/g, '""')}"` : lead.sourceInfo[header];
					} else {
						return ""; // Default empty value for missing fields
					}
				});

				csvRows.push(row.join(",")); // Join row values into a single string
			});
		}

		let csvContent = "data:text/csv;charset=utf-8," + csvHeaders.join(",") + "\n" + csvRows.join("\n");

		const encodedUri = encodeURI(csvContent);
		const link = document.createElement("a");
		link.setAttribute("href", encodedUri);
		link.setAttribute("download", `leads_${exportType}_${new Date().toISOString().slice(0, 10)}.csv`);
		document.body.appendChild(link);

		link.click();
		document.body.removeChild(link);
	}

	// -------------------------------------------------------------------------
	// END EXPORT FUNCTIONALITY
	// -------------------------------------------------------------------------




	// Initial filter and leads load
	// Load leads with the saved filter on initial load

	// At the end of your DOMContentLoaded event:
	// At the end of your DOMContentLoaded event:
	// At the end of your DOMContentLoaded event:
	// At the end of DOMContentLoaded:
	// At the end of DOMContentLoaded:
	// At the end of DOMContentLoaded:
	const savedFilter = localStorage.getItem("selectedFilter") || "All Active Leads";
	document.getElementById("leadFilterDropdown").value = savedFilter;

	// Initialize with proper values
	leadsData.currentPage = 1;
	leadsData.recordsPerPage = document.getElementById("recordsPerPage").value;

	// Then fetch data
	fetchLeads(savedFilter).then(() => {
		console.log("Initial load complete");
		updatePaginationControls();
		renderLeads();
	});

	function logRenderState() {
		console.log("Render triggered - Current state:", {
			allLeads: leadsData.allLeads?.length || 0,
			filteredLeads: leadsData.filteredLeads?.length || 0,
			page: leadsData.currentPage,
			perPage: leadsData.recordsPerPage
		});
	}




	// Dropdown toggle logic
	const moreActionsButton = document.getElementById("moreActionsButton");
	const moreActionsMenu = document.getElementById("moreActionsMenu");

	moreActionsButton.addEventListener("click", function() {
		const isVisible = moreActionsMenu.style.display === "block";
		moreActionsMenu.style.display = isVisible ? "none" : "block";
	});

	// Close dropdown when clicking outside
	document.addEventListener("click", function(event) {
		if (!moreActionsButton.contains(event.target) && !moreActionsMenu.contains(event.target)) {
			moreActionsMenu.style.display = "none";
		}
	});

	/*// Export Popup Logic
	const exportButton = document.getElementById("exportButton");
	const exportPopup = document.getElementById("exportPopup");
	const confirmExportButton = document.getElementById("confirmExportButton");
	const cancelExportButton = document.getElementById("cancelExportButton");

	exportButton.addEventListener("click", function () {
		exportPopup.style.display = "block";
		moreActionsMenu.style.display = "none"; // Hide dropdown
	});

	cancelExportButton.addEventListener("click", function () {
		exportPopup.style.display = "none";
	});*/

	/*confirmExportButton.addEventListener("click", function () {
		const exportRange = document.getElementById("exportRange").value;

		let leadsToExport = [];
		if (exportRange === "all") {
			leadsToExport = leadsData.allLeads; // Export all leads
		} else if (exportRange === "filtered") {
			leadsToExport = leadsData.filteredLeads; // Export filtered leads
		}

		if (leadsToExport.length > 0) {
			downloadCSV(leadsToExport);
		} else {
			alert("No records available for export.");
		}

		exportPopup.style.display = "none"; // Close popup after exporting
	});

	// Function to generate and download CSV file
	function downloadCSV(leads) {
		const csvHeaders = [
			"Lead Owner",
			"Lead Date",
			"Contact Name",
			"Mobile Number",
			"Lead Stage",
			"Expected Revenue",
			"Next Follow-up On",
			"Next Follow-up Notes"
		];

		const csvRows = leads.map((lead) => [
			lead.leadOwner || "",
			lead.leadDate || "",
			lead.contactName || "",
			lead.mobile_number || "",
			lead.leadStage || "",
			lead.expectedRevenue || "",
			lead.nextFollowUpOn || "",
			lead.nextFollowUpNotes || ""
		]);

		const csvContent =
			[csvHeaders.join(","), ...csvRows.map((row) => row.join(","))].join("\n");

		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = `leads_${new Date().toISOString().slice(0, 10)}.csv`;
		link.click();
	    
		console.log("CSV file downloaded successfully.");
	}*/



});