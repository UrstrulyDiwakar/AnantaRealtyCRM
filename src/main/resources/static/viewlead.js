document.addEventListener('DOMContentLoaded', function() {
	initializeLeadView();
	setupButtonListeners();
	updateLastViewed();
	// Initialize call records section
	const section = document.createElement('div');
	section.className = 'last-call-info';
	section.style.display = 'none';
	document.querySelector('.lead-details-container').appendChild(section);
});

let originalLeadData = null;

function initializeLeadView() {
	const viewData = JSON.parse(sessionStorage.getItem('leadViewData'));
	if (!viewData || !viewData.leads || viewData.leads.length === 0) {
		alert('No lead data available');
		window.location.href = 'leads.html';
		return;
	}

	const urlParams = new URLSearchParams(window.location.search);
	const leadId = urlParams.get('leadId');
	let currentIndex = viewData.currentIndex || 0;

	if (leadId) {
		const foundIndex = viewData.leads.findIndex(lead => lead.leadId == leadId);
		if (foundIndex >= 0) {
			currentIndex = foundIndex;
			viewData.currentIndex = currentIndex;
			sessionStorage.setItem('leadViewData', JSON.stringify(viewData));
		}
	}



	updateLeadView(viewData.leads[currentIndex], currentIndex, viewData.leads.length);

	// Add this to load call records for the current lead
	const currentLead = viewData.leads[currentIndex];
	if (currentLead && currentLead.mobileNumber) {
		fetchCallRecords(currentLead.mobileNumber);
	}
}

function setupButtonListeners() {
	// Navigation buttons
	document.querySelector('.nav-button[title="Previous"]')?.addEventListener('click', navigateToPrevious);
	document.querySelector('.nav-button[title="Next"]')?.addEventListener('click', navigateToNext);

	// Action buttons
	document.getElementById('Edit')?.addEventListener('click', enableEditMode);
	document.getElementById('Delete')?.addEventListener('click', confirmDeleteLead);
	document.getElementById('View')?.addEventListener('click', navigateToLeadList);

	// Edit mode buttons
	document.getElementById('Save')?.addEventListener('click', () => saveLead(false));
	document.getElementById('SaveAndNew')?.addEventListener('click', () => saveLead(true));
	document.getElementById('Cancel')?.addEventListener('click', disableEditMode);
}

function navigateTo(direction) {
	const viewData = JSON.parse(sessionStorage.getItem('leadViewData'));
	let currentIndex = viewData.currentIndex || 0;
	const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

	// Validate new index
	if (newIndex < 0 || newIndex >= viewData.leads.length) return;

	// Update current index
	viewData.currentIndex = newIndex;
	sessionStorage.setItem('leadViewData', JSON.stringify(viewData));

	// Update UI immediately
	updateLeadView(viewData.leads[newIndex], newIndex, viewData.leads.length);
	updateUrlWithLeadId(viewData.leads[newIndex].leadId);

	// Fetch call records
	fetchCallRecords(viewData.leads[newIndex].mobileNumber);
}

function navigateToPrevious() {
	navigateTo('prev');
}

function navigateToNext() {
	navigateTo('next');
}

function updateUrlWithLeadId(leadId) {
	window.history.pushState({}, '', `viewlead.html?leadId=${leadId}`);
}

function navigateToLeadList() {
	const viewData = JSON.parse(sessionStorage.getItem('leadViewData'));
	window.location.href = `leads.html?filter=${encodeURIComponent(viewData?.filter || '')}`;
}

function enableEditMode() {
	const viewData = JSON.parse(sessionStorage.getItem('leadViewData'));
	const currentIndex = viewData.currentIndex || 0;
	originalLeadData = { ...viewData.leads[currentIndex] };

	// Hide view buttons, show edit buttons
	document.getElementById('Edit').style.display = 'none';
	document.getElementById('Delete').style.display = 'none';
	document.getElementById('View').style.display = 'none';

	const centerSection = document.querySelector('.center-section');
	centerSection.innerHTML = `
        <button class="action-button" id="Save">💾 Save</button>
        <button class="action-button" id="SaveAndNew">➕ Save & New</button>
        <button class="action-button" id="Cancel">✖️ Cancel</button>
    `;

	makeFieldsEditable();
	setupButtonListeners();
}

function disableEditMode() {
	// Show view buttons, hide edit buttons
	const centerSection = document.querySelector('.center-section');
	centerSection.innerHTML = `
        <button class="action-button" id="Edit">✏️ Edit</button>
        <button class="action-button" id="Delete">🗑️ Delete</button>
        <button class="action-button" id="View">← Back</button>
    `;

	const leadStageSelect = document.getElementById('edit-leadStage');
	if (leadStageSelect) {
		const selectedValue = leadStageSelect.options[leadStageSelect.selectedIndex].text;
		const leadStageElement = document.getElementById('leadStage');
		leadStageElement.innerHTML = selectedValue;
	}

	const viewData = JSON.parse(sessionStorage.getItem('leadViewData'));
	const currentIndex = viewData.currentIndex || 0;
	updateLeadView(originalLeadData || viewData.leads[currentIndex], currentIndex, viewData.leads.length);

	setupButtonListeners();
}

function makeFieldsEditable() {
	const fieldsToEdit = [
		'leadTitle', 'contactName', 'mobileNumber', 'alternateNumbber',
		'emailAddress', 'excepctedRevenue', 'expectedClosingDate',
		'leadOwner', 'nextfollowUpOn', 'nextFollowUpNotes',
		'description', 'campaignName', 'campaignTeam', 'campaignContent'
	];
	// ^ Removed 'caregory' and 'leadSource' from fieldsToEdit since we handle them separately

	const viewData = JSON.parse(sessionStorage.getItem('leadViewData'));
	const currentIndex = viewData.currentIndex || 0;
	const currentLead = viewData.leads[currentIndex];

	// Lead Stage Dropdown
	const leadStageElement = document.getElementById('leadStage');
	if (leadStageElement) {
		const currentValue = currentLead.leadStage || 'NEW';
		leadStageElement.innerHTML = `
            <select class="field-value"  id="edit-leadStage" class="editable-select">
                <option value="NEW" ${currentValue === 'NEW' ? 'selected' : ''}>NEW</option>
                <option value="CONTACTED" ${currentValue === 'CONTACTED' ? 'selected' : ''}>CONTACTED</option>
                <option value="INTERESTED" ${currentValue === 'INTERESTED' ? 'selected' : ''}>INTERESTED</option>
                <option value="FOLLOW-UP" ${currentValue === 'FOLLOW-UP' ? 'selected' : ''}>FOLLOW-UP</option>
                <option value="DEAL CLOSED" ${currentValue === 'DEAL CLOSED' ? 'selected' : ''}>DEAL CLOSED</option>
                <option value="CANCEL LEAD" ${currentValue === 'CANCEL LEAD' ? 'selected' : ''}>CANCEL LEAD</option>
                <option value="NOT INTERESTED" ${currentValue === 'NOT INTERESTED' ? 'selected' : ''}>NOT INTERESTED</option>
                <option value="Site Visit" ${currentValue === 'Site Visit' ? 'selected' : ''}>Site Visit</option>
            </select>
        `;
	}

	// Category Dropdown
	const categoryElement = document.getElementById('caregory');
	if (categoryElement) {
		const currentValue = currentLead.category || '';
		categoryElement.innerHTML = `
            <select class="field-value" id="edit-caregory" class="editable-select">
                <option value="software data" ${currentValue === 'software data' ? 'selected' : ''}>software data</option>
                <option value="insurance data" ${currentValue === 'insurance data' ? 'selected' : ''}>insurance data</option>
                <option value="salaried professionals" ${currentValue === 'salaried professionals' ? 'selected' : ''}>salaried professionals</option>
                <option value="Business owners/entrepreneurs" ${currentValue === 'Business owners/entrepreneurs' ? 'selected' : ''}>Business owners/entrepreneurs</option>
                <option value="Government Employees" ${currentValue === 'Government Employees' ? 'selected' : ''}>Government Employees</option>
                <option value="Students" ${currentValue === 'Students' ? 'selected' : ''}>Students</option>
                <option value="IT Professionals" ${currentValue === 'IT Professionals' ? 'selected' : ''}>IT Professionals</option>
                <option value="Farmers/landowners" ${currentValue === 'Farmers/landowners' ? 'selected' : ''}>Farmers/landowners</option>
                <option value="Freelancers" ${currentValue === 'Freelancers' ? 'selected' : ''}>Freelancers</option>
                <option value="Others" ${currentValue === 'Others' ? 'selected' : ''}>Others</option>
                <option value="OLD DATA" ${currentValue === 'OLD DATA' ? 'selected' : ''}>OLD DATA</option>
                <option value="Marketing Data" ${currentValue === 'Marketing Data' ? 'selected' : ''}>Marketing Data</option>
                <option value="whatsapp data" ${currentValue === 'whatsapp data' ? 'selected' : ''}>whatsapp data</option>
            </select>
        `;
	}

	// Lead Source Dropdown
	const leadSourceElement = document.getElementById('leadSource');
	if (leadSourceElement) {
		const currentValue = currentLead.sourceInfo?.leadSource || '';
		leadSourceElement.innerHTML = `
            <select class="field-value" id="edit-leadSource" class="editable-select">
                <option value="Incoming Call" ${currentValue === 'Incoming Call' ? 'selected' : ''}>Incoming Call</option>
                <option value="WhatsApp" ${currentValue === 'WhatsApp' ? 'selected' : ''}>WhatsApp</option>
                <option value="Website" ${currentValue === 'Website' ? 'selected' : ''}>Website</option>
                <option value="Facebook Ad" ${currentValue === 'Facebook Ad' ? 'selected' : ''}>Facebook Ad</option>
                <option value="Google Ad" ${currentValue === 'Google Ad' ? 'selected' : ''}>Google Ad</option>
                <option value="Indiamart" ${currentValue === 'Indiamart' ? 'selected' : ''}>Indiamart</option>
                <option value="Tradeindia" ${currentValue === 'Tradeindia' ? 'selected' : ''}>Tradeindia</option>
                <option value="Justdial" ${currentValue === 'Justdial' ? 'selected' : ''}>Justdial</option>
                <option value="Sulekha" ${currentValue === 'Sulekha' ? 'selected' : ''}>Sulekha</option>
                <option value="Paper Ad" ${currentValue === 'Paper Ad' ? 'selected' : ''}>Paper Ad</option>
                <option value="Cold Calling" ${currentValue === 'Cold Calling' ? 'selected' : ''}>Cold Calling</option>
                <option value="Reference" ${currentValue === 'Reference' ? 'selected' : ''}>Reference</option>
                <option value="olx" ${currentValue === 'olx' ? 'selected' : ''}>olx</option>
                <option value="old data" ${currentValue === 'old data' ? 'selected' : ''}>old data</option>
                <option value="marketing" ${currentValue === 'marketing' ? 'selected' : ''}>marketing</option>
                <option value="event" ${currentValue === 'event' ? 'selected' : ''}>event</option>
            </select>
        `;
	}



	// Handle all other fields
	fieldsToEdit.forEach(fieldId => {
		const element = document.getElementById(fieldId);
		if (!element) return;

		let currentValue = '';
		if (fieldId === 'expectedClosingDate') {
			currentValue = currentLead.expectedClosingDate || '';
		} else if (fieldId === 'nextfollowUpOn') {
			currentValue = currentLead.nextFollowUpOn || '';
		} else {
			currentValue = element.textContent.trim() === '-' ? '' : element.textContent;
		}

		if (fieldId === 'emailAddress') {
			const email = element.querySelector('a')?.textContent || currentValue;
			element.innerHTML = `<input class="field-value" type="email" id="edit-${fieldId}" value="${email}">`;
		}
		else if (fieldId === 'mobileNumber' || fieldId === 'alternateNumbber') {
			const number = currentValue.split(' ')[0];
			element.innerHTML = `<input class="field-value" type="tel" id="edit-${fieldId}" value="${number}">`;
		}
		else if (fieldId === 'expectedClosingDate') {
			const dateValue = currentValue ? formatDateForInput(currentValue) : '';
			element.innerHTML = `<input type="date" class="field-value" id="edit-${fieldId}" value="${dateValue}">`;
		}
		else if (fieldId === 'nextfollowUpOn') {
			const dateTimeValue = currentValue ? formatDateTimeForInput(currentValue) : '';
			element.innerHTML = `<input class="field-value" type="datetime-local" id="edit-${fieldId}" value="${dateTimeValue}">`;
		}
		else if (fieldId === 'excepctedRevenue') {
			const amount = currentValue.replace('₹', '').replace(/,/g, '');
			element.innerHTML = `<input class="field-value" type="number" id="edit-${fieldId}" value="${amount}">`;
		}
		else if (fieldId === 'leadOwner') {
			element.innerHTML = `
                <div style="display: flex; align-items: center; gap: 5px;">
                    <input class="field-value" type="text" id="edit-leadOwner" value="${currentValue}">
                    <span id="leadOwnerName" class="user-icon" onclick="openUserPopup()" style="cursor: pointer;">👤</span>
                    <input class="field-value"  type="hidden" id="leadOwnerEmail" name="leadOwnerEmail" value="${currentLead.leadOwnerEmail || ''}">
                </div>
            `;
		}
		else {
			element.innerHTML = `<input class="field-value" type="text" id="edit-${fieldId}" value="${currentValue}">`;
		}
	});
}

async function saveLead(andNew = false) {
	const viewData = JSON.parse(sessionStorage.getItem('leadViewData'));
	const currentIndex = viewData.currentIndex || 0;
	const currentLead = viewData.leads[currentIndex];
	const currentDateTime = new Date().toISOString();

	const leadOwnerEmail = document.getElementById('leadOwnerEmail')?.value ||
		currentLead.leadOwnerEmail;
	const createdBy = currentLead.sourceInfo?.createdBy ||
		document.getElementById('edit-createdBy')?.value ||
		await fetchLoggedInUsername();

	const editedLead = {
		...currentLead,
		leadTitle: document.getElementById('edit-leadTitle')?.value || '',
		contactName: document.getElementById('edit-contactName')?.value || '',
		mobileNumber: document.getElementById('edit-mobileNumber')?.value || '',
		alternateNumber: document.getElementById('edit-alternateNumbber')?.value || '',
		emailAddress: document.getElementById('edit-emailAddress')?.value || '',
		expectedRevenue: parseFloat(document.getElementById('edit-excepctedRevenue')?.value) || 0,
		expectedClosingDate: getDateInputValue('expectedClosingDate'),
		nextFollowUpOn: getDateTimeInputValue('nextfollowUpOn'),
		leadOwner: document.getElementById('edit-leadOwner')?.value || '',
		leadOwnerEmail: leadOwnerEmail,
		leadStage: document.getElementById('edit-leadStage')?.value || currentLead.leadStage,
		category: document.getElementById('edit-caregory')?.value || '',
		nextFollowUpNotes: document.getElementById('edit-nextFollowUpNotes')?.value || '',
		description: document.getElementById('edit-description')?.value || '',
		sourceInfo: {
			...currentLead.sourceInfo,
			leadSource: document.getElementById('edit-leadSource')?.value || '',
			campaignName: document.getElementById('edit-campaignName')?.value || '',
			campaignTerm: document.getElementById('edit-campaignTeam')?.value || '',
			campaignContent: document.getElementById('edit-campaignContent')?.value || '',
			createdBy: createdBy,
		},
		leadHistory: {
			...(currentLead.leadHistory || {}),
			modifiedTime: currentDateTime
		}
	};

	try {
		const saveBtn = document.getElementById('Save');
		saveBtn.disabled = true;
		saveBtn.textContent = 'Saving...';
		console.log("sendind:" + editedLead);
		const response = await fetch(`http://localhost:8085/api/${editedLead.leadId}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},

			body: JSON.stringify(editedLead)
		});


		if (!response.ok) {
			throw new Error(await response.text());
		}

		const updatedLead = await response.json();
		viewData.leads[currentIndex] = updatedLead;
		sessionStorage.setItem('leadViewData', JSON.stringify(viewData));

		if (andNew) {
			const newLead = createNewEmptyLead();
			viewData.leads.splice(currentIndex + 1, 0, newLead);
			viewData.currentIndex = currentIndex + 1;
			sessionStorage.setItem('leadViewData', JSON.stringify(viewData));

			// First update the view with the new empty lead
			updateLeadView(newLead, currentIndex + 1, viewData.leads.length);

			// Then completely rebuild the edit interface
			rebuildEditInterface();
		} else {
			disableEditMode();
			updateLeadView(updatedLead, currentIndex, viewData.leads.length);
		}
	} catch (error) {
		console.error('Error saving lead:', error);
		alert(error.message || 'Failed to save lead');
	} finally {
		const saveBtn = document.getElementById('Save');
		if (saveBtn) {
			saveBtn.disabled = false;
			saveBtn.textContent = '💾 Save';
		}
	}
}

// Add this new helper function to clear form fields
async function clearFormFields() {
	try {
		// Get current user
		const username = await fetchLoggedInUsername();

		// Wait for DOM to update
		setTimeout(() => {
			// Clear all editable fields
			const fieldsToClear = [
				'edit-leadTitle', 'edit-contactName', 'edit-mobileNumber',
				'edit-alternateNumbber', 'edit-emailAddress', 'edit-excepctedRevenue',
				'edit-expectedClosingDate', 'edit-leadOwner', 'edit-leadStage',
				'edit-caregory', 'edit-nextfollowUpOn', 'edit-nextFollowUpNotes',
				'edit-description', 'edit-leadSource', 'edit-campaignName',
				'edit-campaignTeam', 'edit-campaignContent'
			];

			fieldsToClear.forEach(fieldId => {
				const element = document.getElementById(fieldId);
				if (element) element.value = '';
			});

			// Set current date
			document.getElementById('leadDate').value = new Date().toISOString().split('T')[0];

			// Set createdBy to current user (readonly)
			const createdByInput = document.getElementById('edit-createdBy');
			if (createdByInput) {
				createdByInput.value = username;
				createdByInput.readOnly = true;
			}

			// Also update the display version
			const createdByDisplay = document.getElementById('createdBy');
			if (createdByDisplay) {
				createdByDisplay.textContent = username;
			}
		}, 50);
	} catch (error) {
		console.error('Error clearing form fields:', error);
	}
}

function rebuildEditInterface() {
	// First ensure we're in edit mode structure
	const centerSection = document.querySelector('.center-section');
	if (centerSection) {
		centerSection.innerHTML = `
            <button class="action-button" id="Save">💾 Save</button>
            <button class="action-button" id="SaveAndNew">➕ Save & New</button>
            <button class="action-button" id="Cancel">✖️ Cancel</button>
        `;
	}

	// Then make fields editable
	makeFieldsEditable();

	// Finally re-setup button listeners
	setupButtonListeners();

	// Clear all form fields
	const fieldsToClear = [
		'edit-leadTitle', 'edit-contactName', 'edit-mobileNumber',
		'edit-alternateNumbber', 'edit-emailAddress', 'edit-excepctedRevenue',
		'edit-expectedClosingDate', 'edit-leadOwner', 'edit-leadStage',
		'edit-caregory', 'edit-nextfollowUpOn', 'edit-nextFollowUpNotes',
		'edit-description', 'edit-leadSource', 'edit-campaignName',
		'edit-campaignTeam', 'edit-campaignContent'
	];


	fieldsToClear.forEach(fieldId => {
		const element = document.getElementById(fieldId);
		if (element) element.value = '';
	});

	const leadOwnerEmail = document.getElementById('leadOwnerEmail');
	if (leadOwnerEmail) leadOwnerEmail.value = '';
}

function getDateInputValue(fieldId) {
	const value = document.getElementById(`edit-${fieldId}`)?.value;
	return value ? `${value}T00:00:00.000Z` : ''; // Ensure full ISO format
}

function getDateTimeInputValue(fieldId) {
	const value = document.getElementById(`edit-${fieldId}`)?.value;
	return value ? `${value}:00.000Z` : ''; // Ensure full ISO format
}

async function confirmDeleteLead() {
	if (!confirm('Are you sure you want to delete this lead?')) return;

	const viewData = JSON.parse(sessionStorage.getItem('leadViewData'));
	const currentIndex = viewData.currentIndex || 0;
	const currentLead = viewData.leads[currentIndex];

	try {
		const response = await fetch(`http://localhost:8085/api/${currentLead.leadId}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			throw new Error('Failed to delete lead');
		}

		viewData.leads.splice(currentIndex, 1);

		if (viewData.leads.length === 0) {
			window.location.href = 'leads.html';
			return;
		}

		let newIndex = currentIndex;
		if (newIndex >= viewData.leads.length) {
			newIndex = viewData.leads.length - 1;
		}

		viewData.currentIndex = newIndex;
		sessionStorage.setItem('leadViewData', JSON.stringify(viewData));

		const nextLead = viewData.leads[newIndex];
		updateLeadView(nextLead, newIndex, viewData.leads.length);
		updateUrlWithLeadId(nextLead.leadId);

	} catch (error) {
		console.error('Delete error:', error);
		alert('Failed to delete lead. Please try again.');
	}
}

function createNewEmptyLead() {
	return {
		leadId: '',
		leadTitle: '',
		contactName: '',
		mobileNumber: '',
		alternateNumber: '',
		emailAddress: '',
		expectedRevenue: 0,
		expectedClosingDate: '',
		leadOwner: '',
		leadOwnerEmail: '',
		leadStage: '',
		category: '',
		nextFollowUpOn: '',
		nextFollowUpNotes: '',
		description: '',
		sourceInfo: {
			leadSource: '',
			campaignName: '',
			campaignTerm: '',
			campaignContent: '',
			leadDate: new Date().toISOString().split('T')[0],
			createdBy: 'Current User'
		},
		leadHistory: {
			leadCreation: new Date().toISOString(),
			modifiedTime: null,
			lastViewed: null
		}
	};
}

// Utility functions for consistent date/time handling
function getCurrentISODateTime() {
	const now = new Date();
	// Format: YYYY-MM-DDTHH:MM:SS.sssZ (ISO 8601)
	return now.toISOString();
}

function formatDateTimeForDisplay(isoString) {
	if (!isoString) return '-';
	const date = new Date(isoString);
	if (isNaN(date.getTime())) return '-';

	const options = {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		hour12: true
	};
	return date.toLocaleString('en-GB', options);
}

function formatLocalDateTimeForBackend(date) {
	const pad = n => n.toString().padStart(2, '0');
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T` +
		`${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function formatDateForInput(isoString) {
	if (!isoString) return '';
	const date = new Date(isoString);
	if (isNaN(date.getTime())) return '';
	return date.toISOString().split('T')[0];
}

function formatDateTimeForInput(isoString) {
	if (!isoString) return '';
	const date = new Date(isoString);
	if (isNaN(date.getTime())) return '';
	// Returns format: YYYY-MM-DDTHH:MM (for datetime-local inputs)
	return date.toISOString().slice(0, 16);
}

function updateLeadView(lead, currentIndex, totalLeads) {

	console.log(lead)
	function getElement(id) {
		const el = document.getElementById(id);
		if (!el) console.error(`Element with ID '${id}' not found`);
		return el;
	}

	const counter = document.querySelector('.nav-counter');
	if (counter) counter.textContent = `${currentIndex + 1}/${totalLeads}`;

	setTextContent('leadTitle', lead.leadTitle);
	setTextContent('contactName', lead.contactName);
	setTextContent('leadOwner', lead.leadOwner);
	document.getElementById('leadOwnerEmail').value

	// Lead stage (ensure it's displayed as text, not dropdown)
	setTextContent('leadStage', lead.leadStage || '-');


	updatePhoneField('mobileNumber', lead.mobileNumber);
	updatePhoneField('alternateNumbber', lead.alternateNumber);
	// Notes and description
	setTextContent('nextFollowUpNotes', lead.nextFollowUpNotes || '-');
	setTextContent('description', lead.description || '-');
	setTextContent('caregory', lead.caregory || '-');


	// Dates
	setTextContent('leadDate', lead.leadDate || '-');
	setTextContent('expectedClosingDate', lead.expectedClosingDate ? formatDateTimeForDisplay(lead.expectedClosingDate) : '-');
	setTextContent('nextfollowUpOn', lead.nextFollowUpOn ? formatDateTimeForDisplay(lead.nextFollowUpOn) : '-');

	// Financial info
	setTextContent('excepctedRevenue', lead.expectedRevenue ? `₹${formatNumber(lead.expectedRevenue)}` : '-');

	setTextContent('createdBy', lead.sourceInfo?.createdBy || '-');
	setTextContent('createdBy', lead.sourceInfo?.createdBy || '-');
	setTextContent('leadSource', lead.sourceInfo.leadSource);
	setTextContent('campaignName', lead.sourceInfo.campaignName);
	setTextContent('campaignTeam', lead.sourceInfo.campaignTeam);
	setTextContent('campaignContent', lead.sourceInfo.campaignContent);



	const email = getElement('emailAddress');
	if (email) {
		email.innerHTML = lead.emailAddress ?
			`<a href="mailto:${lead.emailAddress}" class="email-link">${lead.emailAddress}</a>` :
			'-';
	}



	setTextContent('expectedClosingDate', lead.expectedClosingDate ? formatDateTimeForDisplay(lead.expectedClosingDate) : '-');
	setTextContent('nextfollowUpOn', lead.nextFollowUpOn ? formatDateTimeForDisplay(lead.nextFollowUpOn) : '-');

	// For history dates
	setTextContent('createdTime', `Created Time: ${lead.leadHistory?.leadCreation ? formatDateTimeForDisplay(lead.leadHistory.leadCreation) : formatDateTimeForDisplay(lead.leadDate)}`);
	setTextContent('mofifiedTime', `Modified Time: ${lead.leadHistory?.modifiedTime ? formatDateTimeForDisplay(lead.leadHistory.modifiedTime) : formatDateTimeForDisplay(lead.leadDate)}`);
	setTextContent('lastViewed', `Last Viewed Time: ${lead.leadHistory?.lastViewed ? formatDateTimeForDisplay(lead.leadHistory.lastViewed) : formatDateTimeForDisplay(getCurrentISODateTime())}`);

	function setTextContent(id, value) {
		const el = getElement(id);
		if (el) el.textContent = value || '-';
	}

	function updatePhoneField(id, number) {
		const el = getElement(id);
		if (el) {
			el.innerHTML = number ?
				`${number} <button class="whatsapp-button" title="Message on WhatsApp">
                    <img src="/images/whatsapp-icon.png" alt="WhatsApp" 
                         onerror="this.src='https://cdn-icons-png.flaticon.com/512/3670/3670051.png'">
                </button>` :
				'-';
		}
	}

	function formatNumber(num) {
		return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}

	// At the end of the function, fetch call records
	if (lead && lead.mobileNumber) {
		fetchCallRecords(lead.mobileNumber);
	}
}



function updateLastViewed() {
	try {
		const viewData = JSON.parse(sessionStorage.getItem('leadViewData'));
		if (!viewData?.leads?.length) return;



		const currentIndex = viewData.currentIndex || 0;
		const currentLead = viewData.leads[currentIndex];
		// Add this to load call records for the current lead
		if (currentLead && currentLead.mobileNumber) {
			fetchCallRecords(currentLead.mobileNumber);
		}

		// More robust lead validation
		if (!currentLead ||
			(currentLead.leadId === undefined && currentLead.id === undefined)) {
			console.warn('Invalid lead data - no ID found', currentLead);
			return;
		}

		// Get the ID whichever way it's stored
		const leadId = currentLead.leadId || currentLead.id;

		// Skip if we can't determine an ID
		if (!leadId) {
			console.warn('No valid lead ID found', currentLead);
			return;
		}

		const now = new Date();
		const currentDateTime = formatLocalDateTimeForBackend(now);

		const updatedLead = {
			...currentLead,
			leadHistory: {
				...(currentLead.leadHistory || {}),
				lastViewed: currentDateTime
			}
		};

		console.log(updatedLead)

		viewData.leads[currentIndex] = updatedLead;
		sessionStorage.setItem('leadViewData', JSON.stringify(viewData));

		// Skip temporary/new leads (check both possible ID formats)
		const isNewLead = (typeof leadId === 'string' && leadId.startsWith('new-')) ||
			(typeof leadId === 'number' && leadId < 0);

		if (!isNewLead) {
			fetch(`http://localhost:8085/api/${leadId}/history`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					lastViewed: currentDateTime
				})
			}).catch(err => console.error('Failed to update last viewed:', err));
		}
	} catch (error) {
		console.error('Error updating last viewed:', error);
	}
}

// Open User Selection Popup
function openUserPopup() {
	console.log("Opening user selection popup");
	fetch("http://localhost:8085/api/getUsers")
		.then(response => response.json())
		.then(users => {
			console.log(users)
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
					console.log(user);
					document.getElementById("edit-leadOwner").value = user.username || '';
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



// Modified fetchCallRecords with better error handling
function fetchCallRecords(mobileNumber) {
	const section = document.querySelector('.last-call-info');
	if (!section) return;

	// Show loading state by setting all fields to 'Loading...'
	const fieldValues = section.querySelectorAll('.field-value');
	fieldValues.forEach(el => el.textContent = 'Loading...');
	section.style.display = 'block';

	if (!mobileNumber) {
		showNoCallRecords();
		return;
	}

	const cleanNumber = mobileNumber.replace(/\D/g, '');
	if (cleanNumber.length < 10) {
		showNoCallRecords();
		return;
	}

	fetch(`http://localhost:8085/api/call-records/by-phone?phoneNumber=${cleanNumber}`)
		.then(response => {
			if (!response.ok) throw new Error('Failed to fetch call records');
			return response.json();
		})
		.then(callRecords => {
			if (callRecords && callRecords.length > 0) {
				const sortedRecords = callRecords.sort((a, b) =>
					new Date(b.startTime) - new Date(a.startTime));
				updateCallInfoUI(sortedRecords[0]);
			} else {
				showNoCallRecords();
			}
		})
		.catch(error => {
			console.error('Error fetching call records:', error);
			showCallRecordsError(error.message);
		});
}

function showCallRecordsError(errorMsg) {
	const section = document.querySelector('.last-call-info');
	if (!section) return;

	// Set all fields to show error
	const fieldValues = section.querySelectorAll('.field-value');
	fieldValues.forEach(el => el.textContent = 'Error');

	// Make the status field show the actual error
	const statusElement = findFieldValueElement(section, 'Call Status');
	if (statusElement) {
		statusElement.textContent = errorMsg;
		statusElement.className = 'field-value call-error';
	}

	section.style.display = 'block';
}

function resetCallInfoUI() {
	const section = document.querySelector('.last-call-info');
	if (section) {
		section.innerHTML = `
            <div class="section-header">Last Call Info</div>
            <div class="loading-call-records">
                Loading call records...
            </div>
        `;
		section.style.display = 'block';
	}
}

function updateCallInfoUI(callRecord) {
	const section = document.querySelector('.last-call-info');
	if (!section) return;

	// Update each field individually instead of rebuilding the entire section
	setFieldValue(section, 'Caller Name', callRecord.contactName || 'Unknown');
	setFieldValue(section, 'Last Call Time', formatDateTime(callRecord.startTime));
	setFieldValue(section, 'Call Duration', formatCallDuration(callRecord.durationSeconds));

	// Call Status with special styling
	const statusElement = findFieldValueElement(section, 'Call Status');
	if (statusElement) {
		statusElement.textContent = callRecord.connected ? 'Connected' : 'Not Connected';
		statusElement.className = 'field-value ' + (callRecord.connected ? 'call-connected' : 'call-not-connected');
	}

	setFieldValue(section, 'Reason For Not Connected',
		!callRecord.connected ? (callRecord.disconnectReason || 'Call not answered') : '-');
	setFieldValue(section, 'Is Call Missed', callRecord.missed ? 'Yes' : 'No');
	setFieldValue(section, 'Contact Reference', callRecord.reference || '-');

	// Make sure the section is visible
	section.style.display = 'block';
}

// Helper function to set field values
function setFieldValue(section, labelText, value) {
	const fieldValueElement = findFieldValueElement(section, labelText);
	if (fieldValueElement) {
		fieldValueElement.textContent = value;
	}
}

// Helper function to find the field value element by label text
function findFieldValueElement(section, labelText) {
	const labels = section.querySelectorAll('.field-label');
	for (const label of labels) {
		if (label.textContent.trim() === labelText) {
			return label.nextElementSibling; // Assuming the value is always the next sibling
		}
	}
	return null;
}

function formatCallDuration(seconds) {
	if (!seconds) return 'Not available';
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins}m ${secs}s`;
}

function formatDateTime(dateTimeString) {
	const options = {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		hour12: true
	};
	return new Date(dateTimeString).toLocaleString('en-IN', options);
}

function showNoCallRecords() {
	const section = document.querySelector('.last-call-info');
	if (!section) return;

	// Reset all fields to '-'
	const fieldValues = section.querySelectorAll('.field-value');
	fieldValues.forEach(el => el.textContent = '-');

	// Reset any special classes
	const statusElement = findFieldValueElement(section, 'Call Status');
	if (statusElement) {
		statusElement.className = 'field-value';
	}

	// Make sure the section is visible
	section.style.display = 'block';
}

function showCallRecordsError(errorMsg) {
	const section = document.querySelector('.last-call-info');
	if (section) {
		section.innerHTML = `
            <div class="section-header">Last Call Info</div>
            <div class="call-records-error">
                Error loading call records: ${errorMsg}
            </div>
        `;
	}
}


function updateLeadUI(lead) {
	// Update all the lead fields in your UI
	document.getElementById('leadTitle').textContent = lead.leadTitle || '-';
	document.getElementById('contactName').textContent = lead.contactName || '-';
	document.getElementById('mobileNumber').textContent = lead.mobileNumber || '-';
	document.getElementById('alternateNumber').textContent = lead.alternateNumber || '-';
	document.getElementById('emailAddress').textContent = lead.emailAddress ?
		`<a href="mailto:${lead.emailAddress}" class="email-link">${lead.emailAddress}</a>` : '-';
	document.getElementById('excepctedRevenue').textContent = lead.expectedRevenue || '-';
	document.getElementById('expectedClosingDate').textContent = lead.expectedClosingDate || '-';
	document.getElementById('leadOwner').textContent = lead.leadOwner || '-';
	document.getElementById('leadStage').textContent = lead.leadStage || '-';
	document.getElementById('caregory').textContent = lead.category || '-';
	document.getElementById('nextfollowUpOn').textContent = lead.nextFollowUpOn ?
		formatDateTime(lead.nextFollowUpOn) : '-';
	document.getElementById('nextFollowUpNotes').textContent = lead.nextFollowUpNotes || '-';
	document.getElementById('description').textContent = lead.description || '-';
	document.getElementById('leadDate').textContent = lead.leadDate || '-';
	document.getElementById('createdBy').textContent = lead.createdBy || '-';

	// Set the lead owner email in hidden field
	document.getElementById('leadOwnerEmail').value = lead.leadOwnerEmail || '';
}
