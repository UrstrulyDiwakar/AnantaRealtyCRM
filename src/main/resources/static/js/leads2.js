import { leadsData, searchedLeadsData, setCurrentPage, setRecordsPerPage } from "./leadsStore.js";


document.addEventListener('DOMContentLoaded', function() {
	// Define all lead variables dynamically for dropdown options
	const leadVariables = [
		"contactName",
		"emailAddress",
		"mobile_number",
		"alternateNumber",
		"leadOwner",
		"leadStage",
		"expectedRevenue",
		"leadDate",
		"nextFollowUpOn",
		"description"
	];

	// Function to populate dropdown dynamically
	function populateDropdown(selectElem) {
		selectElem.innerHTML = leadVariables
			.map(variable => `<option value="${variable}">${variable}</option>`)
			.join("");
	}

	// Function to toggle search form visibility
	window.toggleSearch = function() {
		const searchForm = document.getElementById('mainSearchForm');
		searchForm.style.display = searchForm.style.display === 'none' ? 'block' : 'none';

		// Reinitialize pagination buttons when search visibility changes
		setupPagination();
	};

	// Function to determine which pagination behavior to use
	function shouldUseLeads2Behavior() {
		const searchForm = document.getElementById('mainSearchForm');
		return searchForm && searchForm.style.display !== 'none';
	}

	// Setup pagination based on search form visibility
	function setupPagination() {
		// Remove any existing event listeners first
		document.getElementById("prevPage").replaceWith(document.getElementById("prevPage").cloneNode(true));
		document.getElementById("nextPage").replaceWith(document.getElementById("nextPage").cloneNode(true));

		if (shouldUseLeads2Behavior()) {
			setupLeads2Pagination();
		} else {
			setupLeadsPagination();
		}
	}

	// leads2.js pagination behavior
	function setupLeads2Pagination() {
		// Previous Page Button
		document.getElementById("prevPage").addEventListener("click", function() {
			if (leadsData.currentPage > 1) {
				setCurrentPage(leadsData.currentPage - 1);
				refreshDisplay();
			}
		});

		// Next Page Button
		document.getElementById("nextPage").addEventListener("click", function() {
			const activeDataset = leadsData.searchfilteredLeads.length > 0
				? leadsData.searchfilteredLeads
				: leadsData.filteredLeads;

			if (leadsData.currentPage * leadsData.recordsPerPage < activeDataset.length) {
				setCurrentPage(leadsData.currentPage + 1);
				refreshDisplay();
			}
		});
	}

	// leads.js pagination behavior
	function setupLeadsPagination() {
		// Previous Page Button
		document.getElementById("prevPage").addEventListener("click", function() {
			if (leadsData.currentPage > 1) {
				setCurrentPage(leadsData.currentPage - 1);
				renderLeads();
			}
		});

		// Next Page Button
		document.getElementById("nextPage").addEventListener("click", function() {
			if (leadsData.currentPage * leadsData.recordsPerPage < leadsData.filteredLeads.length) {
				setCurrentPage(leadsData.currentPage + 1);
				renderLeads();
			}
		});
	}

	// Initialize pagination when the page loads
	document.addEventListener('DOMContentLoaded', function() {
		setupPagination();
	});

	// Function to show the selected form (Basic or Advanced)
	window.showForm = function(formId) {
		const basicForm = document.getElementById('basicForm');
		const advancedForm = document.getElementById('advancedForm');
		const basicBtn = document.getElementById('basicBtn');
		const advancedBtn = document.getElementById('advancedBtn');

		if (formId === 'basic') {
			basicForm.classList.add('visibleForm');
			advancedForm.classList.remove('visibleForm');
			basicBtn.classList.add('activeTab');
			advancedBtn.classList.remove('activeTab');
			clearAdvancedForm();
		} else if (formId === 'advanced') {
			clearBasicForm();
			advancedForm.classList.add('visibleForm');
			basicForm.classList.remove('visibleForm');
			advancedBtn.classList.add('activeTab');
			basicBtn.classList.remove('activeTab');
		}
	};

	// Function to clear the form
	window.clearform = function() {
		clearBasicForm();
		clearAdvancedForm();
	};

	// Function to clear Basic Form
	function clearBasicForm() {
		const basicForm = document.getElementById('basicForm');

		// Clear Basic Form
		if (basicForm.classList.contains('visibleForm')) {
			const inputs = basicForm.querySelectorAll('input[type="text"], input[type="email"], input[type="date"]');
			inputs.forEach(input => input.value = '');
		}
	}

	// Function to clear Advanced Form
	function clearAdvancedForm() {
		const advancedFields = document.getElementById('advancedFields');

		// Remove existing rows
		while (advancedFields.firstChild) {
			advancedFields.removeChild(advancedFields.firstChild);
		}

		// Add a new initial row
		addRow();
	}

	// Function to cancel the search and hide the search form
	window.cancelSearch = function() {
		const searchForm = document.getElementById('mainSearchForm');
		searchForm.style.display = 'none';
		leadsData.searchfilteredLeads = []; // Clear old search results
	};

	// Define addRow globally so it can be called from HTML onclick attribute
	window.addRow = function() {
		let container = document.getElementById('advancedFields');
		if (container) {
			let operator = document.querySelector('input[name="match"]:checked')?.value || 'AND';
			let newRow = document.createElement('div');
			newRow.classList.add('mainAdvancedRow');
			newRow.innerHTML = `
                <span class='andLabel'>${operator}</span>
                <select class='fieldType' onchange='handleDateFieldChange(this)'></select>
                <select class='conditionSelect' onchange='handleConditionChange(this)'>
                    <option>is</option>
                    <option>is not</option>
                    <option>begins with</option>
                    <option>begins with</option>
                    <option>ends with</option>
                    <option>contains</option>
                    <option>not contains</option>
                    <option>is empty</option>
                    <option>is not empty</option>
                </select>
                <input type='text' class='valueInput' style='visibility: visible;'>
            `;
			container.appendChild(newRow);

			// Populate the dropdown with lead variables for the new row
			const fieldTypeDropdown = newRow.querySelector('.fieldType');
			populateDropdown(fieldTypeDropdown);

			// Trigger handleDateFieldChange to set initial input type
			handleDateFieldChange(fieldTypeDropdown);
		}
	};

	// Define removeRow globally so it can be called from HTML onclick attribute
	window.removeRow = function() {
		let container = document.getElementById('advancedFields');
		if (container && container.children.length > 1) {  // Ensure at least one row remains
			container.removeChild(container.lastElementChild);
		}
	};

	// Define updateOperators globally so it can be called from HTML onclick attribute
	window.updateOperators = function() {
		let operator = document.querySelector('input[name="match"]:checked')?.value || 'AND';
		let labels = document.querySelectorAll('.andLabel');
		labels.forEach(label => label.textContent = operator);
	};

	// NEW: Define handleDateFieldChange globally
	window.handleDateFieldChange = function(selectElem) {
		const conditionDropdown = selectElem.nextElementSibling;
		const valueInput = conditionDropdown.nextElementSibling;

		// Check if the selected field is a date-related field
		const dateFields = ["leadDate", "nextFollowUpOn"];

		if (dateFields.includes(selectElem.value)) {
			// Replace condition dropdown with date-specific options
			conditionDropdown.innerHTML = `
                <option>is</option>
                <option>is not</option>
                <option>is before</option>
                <option>is after</option>
            `;
			valueInput.type = 'date'; // Change input type to date
		} else {
			// Restore default condition options
			conditionDropdown.innerHTML = `
                <option>is</option>
                <option>is not</option>
                <option>begins with</option>
                <option>ends with</option>
                <option>contains</option>
                <option>not contains</option>
                <option>is empty</option>
                <option>is not empty</option>
            `;
			valueInput.type = 'text'; // Change input type back to text
		}

		// Call handleConditionChange to hide/show input based on current condition.
		handleConditionChange(conditionDropdown);
		console.log("12. Came at calling condition from handleDateFieldChange");
	};

	// NEW: Define handleConditionChange globally
	window.handleConditionChange = function(conditionSelect) {
		// Find the parent row
		const row = conditionSelect.closest('.mainAdvancedRow');

		// Ensure the row was found
		if (!row) {
			console.error('Could not find parent row for conditionSelect');
			return;
		}

		// Find the valueInput within the row
		const valueInput = row.querySelector('.valueInput');

		// Ensure the valueInput was found
		if (!valueInput) {
			console.error('Could not find valueInput in the row');
			return;
		}

		const selectedCondition = conditionSelect.value;
		console.log("14. Selected condition:", selectedCondition);

		if (selectedCondition === "is empty" || selectedCondition === "is not empty") {
			valueInput.style.display = 'none'; // Hide input for these conditions
		} else {
			valueInput.style.display = 'block'; // Show input for other conditions
		}
	};

	// Function to perform the search
	function performSearch() {
		const basicForm = document.getElementById('basicForm');
		let searchCriteria = {};

		if (basicForm.classList.contains('visibleForm')) {
			searchCriteria = getBasicFormCriteria();
		} else {
			searchCriteria = getAdvancedSearchCriteria();
		}

		const searchResults = searchLeads(searchCriteria);

		// Update search results in store
		searchedLeadsData(searchResults);

		// Reset to first page and render
		setCurrentPage(1);
		renderSearchResults(searchResults);
	}

	function renderSearchResults(searchResults) {
		const tableBody = document.getElementById("leads-table-body");
		if (!tableBody) {
			console.error("Table body not found!");
			return;
		}

		tableBody.innerHTML = "";

		// Get paginated results
		const paginatedLeads = getPaginatedLeads(
			searchResults,
			leadsData.currentPage,
			leadsData.recordsPerPage
		);

		if (paginatedLeads.length === 0) {
			tableBody.innerHTML = "<tr><td colspan='9'>No records found.</td></tr>";
		} else {
			// ... rest of your existing row creation code ...
		}

		updatePaginationControls();
	}

	// Function to get search criteria from the Basic Form
	function getBasicFormCriteria() {
		const criteria = {};

		// Map placeholders to lead data keys
		const placeholderToKeyMap = {
			'Contact Name': 'contactName',
			'Email Address': 'emailAddress',
			'Mobile Number': 'mobileNumber',
			'Lead Owner': 'leadOwner',
			'Lead Stage': 'leadStage', // Ensure this key exists in your data
			'Expected Revenue': 'expectedRevenue', // Ensure this key exists in your data
			'Lead Source': 'leadSource', // Ensure this key exists in your data
			'Category': 'category', // Ensure this key exists in your data
			'Assigned Manager': 'assignedManager', // Ensure this key exists in your data
			'Lead Date': 'leadDate', // Ensure this key exists in your data
			'Next Follow-up On': 'nextFollowUpOn' // Ensure this key exists in your data
		};

		const inputs = document.querySelectorAll('#basicForm input[type="text"], #basicForm input[type="email"], #basicForm input[type="date"]');

		inputs.forEach(input => {
			if (input.value.trim() !== '') {
				const key = placeholderToKeyMap[input.placeholder];
				if (key) {
					criteria[key] = input.value.trim().toLowerCase(); // Convert to lowercase for case-insensitive comparison
				}
			}
		});

		return criteria;
	}

	// Function to get advanced search criteria
	function getAdvancedSearchCriteria() {
		const rows = document.querySelectorAll('.mainAdvancedRow');
		const criteriaArray = Array.from(rows).map(row => ({
			field: row.querySelector('.fieldType').value,
			condition: row.querySelector('.conditionSelect').value,
			value: row.querySelector('.valueInput').value.trim().toLowerCase()
		})).filter(({ field, condition, value }) => field && condition && value);

		const operator = document.querySelector('input[name="match"]:checked')?.value || "AND";

		return { operator, criteria: criteriaArray };
	}

	function searchLeads(criteria) {
		if (!criteria.operator && Object.keys(criteria).length === 0) {
			return leadsData.filteredLeads; // Return all leads if no criteria is specified
		}

		// Advanced Search
		if (criteria.operator) {
			return leadsData.filteredLeads.filter(lead => {
				const matches = criteria.criteria.map(({ field, condition, value }) => matchCondition(lead[field]?.toLowerCase(), condition, value));
				const result = criteria.operator === "AND" ? matches.every(Boolean) : matches.some(Boolean);
				return result;
			});
		}

		// Basic Search
		return leadsData.filteredLeads.filter(lead => Object.keys(criteria).every(key => lead[key]?.toLowerCase().includes(criteria[key])));
	}

	function matchCondition(leadValue, condition, value) {
		// Convert leadValue to string for safe comparison
		const leadValueStr = leadValue ? String(leadValue).trim() : "";

		switch (condition) {
			case "is":
				return leadValueStr === value;
			case "is not":
				return leadValueStr !== value;
			case "contains":
				return leadValueStr.includes(value);
			case "not contains":
				return !leadValueStr.includes(value);
			case "begins with":
				return leadValueStr.startsWith(value);
			case "ends with":
				return leadValueStr.endsWith(value);
			case "is empty":
				return leadValueStr === ""; // Check if the field is empty
			case "is not empty":
				return leadValueStr !== ""; // Check if the field is not empty
			default:
				return false; // Default case to handle unexpected conditions
		}
	}

	function getAdvancedSearchCriteria() {
		const rows = document.querySelectorAll('.mainAdvancedRow');

		const criteriaArray = Array.from(rows).map(row => ({
			field: row.querySelector('.fieldType').value,
			condition: row.querySelector('.conditionSelect').value,
			value: row.querySelector('.valueInput').value.trim().toLowerCase()
		}));

		const operator = document.querySelector('input[name="match"]:checked')?.value || "AND";

		return { operator, criteria: criteriaArray };
	}

	// Attach event listener to the Generate button
	const generateBtn = document.querySelector('.generateBtn');
	generateBtn.addEventListener('click', performSearch);

	// Add the first row when the page loads
	function initializeAdvancedForm() {
		const advancedFields = document.getElementById('advancedFields');
		if (advancedFields) {
			// Clear existing rows
			while (advancedFields.firstChild) {
				advancedFields.removeChild(advancedFields.firstChild);
			}

			// Add the initial row
			addRow();
		} else {
			console.error("advancedFields element not found!");
		}
	}

	// Call initializeAdvancedForm when the DOM is fully loaded
	initializeAdvancedForm();


	function renderSearchResults(searchResults) {
		const tableBody = document.getElementById("leads-table-body");
		if (!tableBody) {
			console.error("Table body not found!");
			return;
		}

		tableBody.innerHTML = "";

		// Check if searchResults is empty
		if (searchResults.length === 0) {
			tableBody.innerHTML = "<tr><td colspan='9'>No records found.</td></tr>";
			return; // Exit the function early
		}

		const startIndex = (leadsData.currentPage - 1) * leadsData.recordsPerPage;
		const endIndex = startIndex + leadsData.recordsPerPage;
		const paginatedLeads = searchResults.slice(startIndex, endIndex);

		console.log(`Rendering ${paginatedLeads.length} leads (Page ${leadsData.currentPage})`);

		if (paginatedLeads.length === 0) {
			tableBody.innerHTML = "<tr><td colspan='9'>No records found.</td></tr>";
		} else {
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

	function updatePaginationControls() {
		// Determine which dataset to use (search results or filtered leads)
		const activeDataset = leadsData.searchfilteredLeads.length > 0
			? leadsData.searchfilteredLeads
			: leadsData.filteredLeads;

		// Safely calculate total pages
		const totalItems = activeDataset.length;
		const totalPages = Math.max(1, Math.ceil(totalItems / leadsData.recordsPerPage));

		// Update page info display
		const pageInfoElement = document.getElementById("pageInfo");
		if (pageInfoElement) {
			pageInfoElement.textContent = `Page ${leadsData.currentPage} of ${totalPages}`;
		}

		// Update button states
		const prevButton = document.getElementById("prevPage");
		const nextButton = document.getElementById("nextPage");

		if (prevButton) {
			prevButton.disabled = leadsData.currentPage <= 1;
		}
		if (nextButton) {
			nextButton.disabled = leadsData.currentPage >= totalPages || totalItems === 0;
		}
	}



	// Records Per Page Dropdown
	document.getElementById("recordsPerPage").addEventListener("change", function() {
		const selectedRecordsPerPage = parseInt(this.value);
		setRecordsPerPage(selectedRecordsPerPage);
		setCurrentPage(1);
		refreshDisplay();
	});

	// Helper function to refresh the display
	function refreshDisplay() {
		if (leadsData.searchfilteredLeads.length > 0) {
			renderSearchResults(leadsData.searchfilteredLeads);
		} else {
			renderLeads();
		}
	}
});