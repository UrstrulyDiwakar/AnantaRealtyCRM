        // Global variables
        let currentViewType = '';
        let currentPage = 1;
        let recordsPerPage = 50;
        let totalRecords = 0;
        let totalPages = 1;
        let allData = []; // Stores all data
        let filteredData = []; // Stores filtered data
        let selectedRecords = new Set(); // Stores IDs of selected records
		let currentDetailIndex = 0;
		let currentDetailRecords = [];
		let isEditMode = false;
		let isAddMode = false;
		let currentRecordData = null;
		let originalTaskData = null;
		let currentSelectionField = null;
		let cachedLeads = null;
		let cachedUsers = null;
		let leadsLoading = false;
		let usersLoading = false;

		

		// API endpoints configuration
		const apiEndpoints = {
		    tasks: '/api/tasks',
		    contacts: '/api/contacts',
		    notes: '/api/notes',
		    outbound: '/api/outbound-mails'
		};


         // Add these variables to your existing global variables
         let searchVisible = false;
        const fieldOptions = {
            tasks: ['taskName', 'description', 'status', 'dueDate', 'assignedTo', 'lead', 'createdTime'],
            contacts: ['contactName', 'mobileNumber', 'emailAddress', 'contactOwner', 'isBlocked', 
                      'isOptIn', 'companyName', 'createdDateTime', 'modifiedTimeDate'],
            notes: ['Note', 'createdBy', 'lead', 'opportunity', 'createdDatetime', 'modifiedDateTime'],
            outbound: ['toAddress', 'ccAddress', 'bccAddress', 'subject', 'emailBody', 'fromName', 
                      'status', 'DateTime', 'Reason', 'createdUserName']
        };


        // Add these helper functions
        function showLoading() {
    document.getElementById('loadingContainer').style.display = 'flex';
    document.getElementById('data-table').style.opacity = '0.5'; // Optional: dim table while loading
}

function hideLoading() {
    document.getElementById('loadingContainer').style.display = 'none';
    document.getElementById('data-table').style.opacity = '1'; // Restore full opacity
}

        
        // Toggle search visibility
        function toggleSearch(forceHide = false) {
    const searchDiv = document.getElementById('search-main-div');
    
    if (forceHide) {
        // Only hide if forced (like when canceling or switching pages)
        searchVisible = false;
        searchDiv.style.display = 'none';
    } else {
        // Toggle visibility
        searchVisible = !searchVisible;
        searchDiv.style.display = searchVisible ? 'block' : 'none';
    }
    
    if (searchVisible) {
        initializeSearchForm();
    }
}

        // Initialize search form based on current view
		function initializeSearchForm() {
		    // Clear existing forms
		    document.getElementById('basicFields').innerHTML = '';
		    document.getElementById('advancedFields').innerHTML = '';
		    
		    // Create basic search fields
		    const basicFields = document.getElementById('basicFields');
		    fieldOptions[currentViewType].forEach(field => {
		        const fieldName = field.split('.')[0]; // Handle nested properties
		        const input = document.createElement('input');
		        input.type = 'text';
		        input.placeholder = fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
		        input.id = `basic-${fieldName}`;
		        
		        // Special handling for date fields
		        if (field.toLowerCase().includes('date') || field.toLowerCase().includes('time')) {
		            input.onfocus = function() { 
		                this.type = field.toLowerCase().includes('time') ? 'datetime-local' : 'date'; 
		            };
		            input.onblur = function() { if (!this.value) this.type = 'text'; };
		        }
		        
		        basicFields.appendChild(input);
		    });
		    
		    // Create initial advanced search row
		    addRow();
		}

        // Show either basic or advanced form
        function showForm(formId) {
            document.getElementById('basicForm').classList.toggle('visibleForm', formId === 'basic');
            document.getElementById('advancedForm').classList.toggle('visibleForm', formId === 'advanced');
            document.getElementById('basicBtn').classList.toggle('activeTab', formId === 'basic');
            document.getElementById('advancedBtn').classList.toggle('activeTab', formId === 'advanced');
        }

        // Add a new row to advanced search
        function addRow() {
            const container = document.getElementById('advancedFields');
            const operator = document.querySelector('input[name="match"]:checked')?.value || 'AND';
            const rowCount = container.children.length;
            
            const row = document.createElement('div');
            row.className = 'mainAdvancedRow';
            
            // Only show operator label for additional rows
            if (rowCount > 0) {
                const operatorLabel = document.createElement('span');
                operatorLabel.className = 'andLabel';
                operatorLabel.textContent = operator;
                row.appendChild(operatorLabel);
            }
            
            // Field type dropdown
            const fieldSelect = document.createElement('select');
            fieldSelect.className = 'fieldType';
            fieldSelect.onchange = function() { handleFieldTypeChange(this); };
            
            // Add options based on current view type
            fieldOptions[currentViewType].forEach(field => {
                const option = document.createElement('option');
                option.value = field;
                option.textContent = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                fieldSelect.appendChild(option);
            });
            row.appendChild(fieldSelect);
            
            // Condition dropdown
            const conditionSelect = document.createElement('select');
            conditionSelect.className = 'conditionSelect';
            conditionSelect.innerHTML = `
                <option value="is">is</option>
                <option value="isNot">is not</option>
                <option value="contains">contains</option>
                <option value="notContains">not contains</option>
                <option value="beginsWith">begins with</option>
                <option value="endsWith">ends with</option>
                <option value="isEmpty">is empty</option>
                <option value="isNotEmpty">is not empty</option>
            `;
            row.appendChild(conditionSelect);
            
            // Value input
            const valueInput = document.createElement('input');
            valueInput.type = 'text';
            valueInput.className = 'valueInput';
            row.appendChild(valueInput);
            
            container.appendChild(row);
            
            // Trigger field type change to set proper input type
            handleFieldTypeChange(fieldSelect);
        }

        // Remove the last row from advanced search
        function removeRow() {
            const container = document.getElementById('advancedFields');
            if (container.children.length > 1) {
                container.removeChild(container.lastChild);
            }
        }

        // Update operator labels when match type changes
        function updateOperators() {
            const operator = document.querySelector('input[name="match"]:checked')?.value || 'AND';
            document.querySelectorAll('.andLabel').forEach(label => {
                label.textContent = operator;
            });
        }

        // Handle field type change in advanced search
		function handleFieldTypeChange(select) {
		    const row = select.closest('.mainAdvancedRow');
		    const conditionSelect = row.querySelector('.conditionSelect');
		    const valueInput = row.querySelector('.valueInput');
		    const field = select.value;
		    
		    // Check if this is a date field
		    const isDateField = field.toLowerCase().includes('date') || field.toLowerCase().includes('time');
		    
		    if (isDateField) {
		        // Update condition options for date fields
		        conditionSelect.innerHTML = `
		            <option value="is">is</option>
		            <option value="isNot">is not</option>
		            <option value="before">is before</option>
		            <option value="after">is after</option>
		        `;
		        // Set input type based on whether it's date or datetime
		        if (field.toLowerCase().includes('time')) {
		            valueInput.type = 'datetime-local';
		        } else {
		            valueInput.type = 'date';
		        }
		    } else {
		        // Standard text field options
		        conditionSelect.innerHTML = `
		            <option value="is">is</option>
		            <option value="isNot">is not</option>
		            <option value="contains">contains</option>
		            <option value="notContains">not contains</option>
		            <option value="beginsWith">begins with</option>
		            <option value="endsWith">ends with</option>
		            <option value="isEmpty">is empty</option>
		            <option value="isNotEmpty">is not empty</option>
		        `;
		        valueInput.type = 'text';
		    }
		    
		    // Hide value input for empty/not empty conditions
		    handleConditionChange(conditionSelect);
		}

        // Handle condition change in advanced search
        function handleConditionChange(select) {
            const row = select.closest('.mainAdvancedRow');
            const valueInput = row.querySelector('.valueInput');
            
            if (select.value === 'isEmpty' || select.value === 'isNotEmpty') {
                valueInput.style.display = 'none';
            } else {
                valueInput.style.display = 'block';
            }
        }

        // Clear the search form
        function clearForm() {
            // Clear basic form
            document.querySelectorAll('#basicFields input').forEach(input => {
                input.value = '';
            });
            
            // Clear advanced form
            document.getElementById('advancedFields').innerHTML = '';
            addRow(); // Add initial row back
            
            // Reset to basic tab
            showForm('basic');
        }

        // Cancel search and hide the form
        function cancelSearch() {
            toggleSearch(true);
            // Reset to show all data
            document.getElementById('data-filter').value = 'all';
            applyFilter();
        }

        // Generate search results
        function generateSearch() {
            showLoading();
            setTimeout(() => {
            const isBasic = document.getElementById('basicForm').classList.contains('visibleForm');
            
            if (isBasic) {
                performBasicSearch();
            } else {
                performAdvancedSearch();
            }
            
            // Hide search form after generating results
           // toggleSearch();
           hideLoading();
    }, 100);
        }

        // Perform basic search
        function performBasicSearch() {
            const criteria = {};
            const inputs = document.querySelectorAll('#basicFields input');
            
            inputs.forEach(input => {
                const field = input.id.replace('basic-', '');
                if (input.value.trim()) {
                    criteria[field] = input.value.trim().toLowerCase();
                }
            });
            
            // Filter data based on criteria
            filteredData = allData.filter(item => {
                return Object.keys(criteria).every(key => {
                    const itemValue = String(item[key] || '').toLowerCase();
                    return itemValue.includes(criteria[key]);
                });
            });
            
            // Update pagination
            totalRecords = filteredData.length;
            totalPages = Math.ceil(totalRecords / recordsPerPage);
            currentPage = 1;
            
            updatePaginationControls();
            renderTable();
        }

        // Perform advanced search
		function performAdvancedSearch() {
			const operator = document.querySelector('input[name="match"]:checked')?.value || 'AND';
			   const rows = document.querySelectorAll('.mainAdvancedRow');
			   const conditions = [];
			   
			   rows.forEach(row => {
			       const field = row.querySelector('.fieldType').value;
			       const condition = row.querySelector('.conditionSelect').value;
			       const valueInput = row.querySelector('.valueInput');
			       let value = valueInput.style.display !== 'none' ? valueInput.value.trim() : '';
			       
			       // Convert date inputs to ISO format for comparison
			       if (valueInput.type === 'date' || valueInput.type === 'datetime-local') {
			           if (value) {
			               value = new Date(value).toISOString();
			           }
			       } else {
			           value = value.toLowerCase();
			       }
			       
			       if (field && condition) {
			           conditions.push({ field, condition, value });
			       }
			   });
		    
		    // Filter data based on conditions
		    filteredData = allData.filter(item => {
		        const matches = conditions.map(({ field, condition, value }) => {
		            // Handle nested properties (like lead.contactName)
		            let itemValue;
		            if (field.includes('.')) {
		                const parts = field.split('.');
		                itemValue = item[parts[0]] ? item[parts[0]][parts[1]] : '';
		            } else {
		                itemValue = item[field] || '';
		            }
		            
		            // Convert to string for comparison
		            itemValue = String(itemValue).toLowerCase();
		            
		            // Handle date fields specially
		            const isDateField = field.toLowerCase().includes('date') || field.toLowerCase().includes('time');
		            if (isDateField) {
		                return compareDates(itemValue, value, condition);
		            }
		            
		            // Standard text comparison
		            switch (condition) {
		                case 'is': return itemValue === value;
		                case 'isNot': return itemValue !== value;
		                case 'contains': return itemValue.includes(value);
		                case 'notContains': return !itemValue.includes(value);
		                case 'beginsWith': return itemValue.startsWith(value);
		                case 'endsWith': return itemValue.endsWith(value);
		                case 'isEmpty': return !itemValue;
		                case 'isNotEmpty': return !!itemValue;
		                default: return false;
		            }
		        });
		        
		        return operator === 'AND' ? matches.every(Boolean) : matches.some(Boolean);
		    });
		    
		    // Update pagination
		    totalRecords = filteredData.length;
		    totalPages = Math.ceil(totalRecords / recordsPerPage);
		    currentPage = 1;
		    
		    updatePaginationControls();
		    renderTable();
		}

		// Helper function for date comparisons
		function compareDates(itemDate, searchDate, condition) {
		    if (!itemDate || !searchDate) return false;
		    
		    try {
		        const itemDateObj = new Date(itemDate);
		        const searchDateObj = new Date(searchDate);
		        
		        // Compare just dates if time isn't specified
		        if (searchDate.length <= 10) { // Just date part
		            itemDateObj.setHours(0, 0, 0, 0);
		            searchDateObj.setHours(0, 0, 0, 0);
		        }
		        
		        switch (condition) {
		            case 'is': return itemDateObj.getTime() === searchDateObj.getTime();
		            case 'isNot': return itemDateObj.getTime() !== searchDateObj.getTime();
		            case 'before': return itemDateObj < searchDateObj;
		            case 'after': return itemDateObj > searchDateObj;
		            default: return false;
		        }
		    } catch (e) {
		        console.error('Date comparison error:', e);
		        return false;
		    }
		}
        
        // Format date to DD-MM-YYYY 00:00:00
		function formatDateTime(dateString) {
		    if (!dateString) return null;
		    
		    try {
		        // Handle both ISO format and your custom format
		        let date;
		        if (typeof dateString === 'string') {
		            // If it's already in the correct format, return as-is
		            if (/^\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}$/.test(dateString)) {
		                return dateString;
		            }
		            date = new Date(dateString);
		        } else if (dateString instanceof Date) {
		            date = dateString;
		        } else {
		            return 'Invalid Date';
		        }
		        
		        if (isNaN(date.getTime())) return null;
		        
		        // Format as DD-MM-YYYY HH:MM:SS
		        const day = String(date.getDate()).padStart(2, '0');
		        const month = String(date.getMonth() + 1).padStart(2, '0');
		        const year = date.getFullYear();
		        const hours = String(date.getHours()).padStart(2, '0');
		        const minutes = String(date.getMinutes()).padStart(2, '0');
		        const seconds = String(date.getSeconds()).padStart(2, '0');
		        
		        return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
		    } catch (e) {
		        console.error('Date formatting error:', e);
		        return null;
		    }
		}
        
        // Load data when a card is clicked
        function loadData(type) {
            if (searchVisible) {
                toggleSearch(true);
            }
            currentViewType = type;
            currentPage = 1;
            selectedRecords.clear();
            
            // Show data section and hide form cards
            document.getElementById('data-section').style.display = 'block';
            document.querySelector('.form-container').style.display = 'none';
            document.querySelector('.container h2').textContent = type.charAt(0).toUpperCase() + type.slice(1);
			
			/*/ Show/hide Add button based on view type*/
			    const addButton = document.getElementById('add-button');
			    if (type === 'tasks' || type === 'notes') {
			        addButton.style.display = 'inline-block';
			    } else {
			        addButton.style.display = 'none';
			    }
            
            // Initialize filter dropdown based on view type
            initializeFilterDropdown();
            
            // Fetch data
            fetchData();
        }
        
        function initializeFilterDropdown() {
            const filterDropdown = document.getElementById('data-filter');
            filterDropdown.innerHTML = '';
            
            if (currentViewType === 'tasks') {
                filterDropdown.innerHTML = `
                    <option value="all">Public Views</option>
                    <option value="open">My All Open</option>
                    <option value="overdue">My All Overdue</option>
                    <option value="today">My Due Today</option>
                    <option value="tomorrow">My Due Tomorrow</option>
                    <option value="next7days">My Due Next 7 Days</option>
                `;
            } else if (currentViewType === 'contacts') {
                filterDropdown.innerHTML = `
                    <option value="all">All Contacts</option>
                    <option value="recently_created">Recently Created</option>
                    <option value="recently_updated">Recently Updated</option>
                `;
            } else if (currentViewType === 'notes') {
                filterDropdown.innerHTML = `
                    <option value="all">All Notes</option>
                    <option value="recently_created">Recently Created</option>
                    <option value="recently_updated">Recently Updated</option>
                `;
            } else if (currentViewType === 'outbound') {
                filterDropdown.innerHTML = `
                    <option value="all">All Records</option>
                    <option value="recently_created">Recently Created</option>
                    <option value="today">Today's Records</option>
                `;
            }
        }
        
        // TODO: Replace this with actual API call in production
		async function fetchData() {
		    showLoading();
		    document.getElementById('no-data').style.display = 'none';
		    document.getElementById('table-body').innerHTML = '';
		    
		    try {
		        const response = await fetch(apiEndpoints[currentViewType], {
		            headers: {
		                'Content-Type': 'application/json',
		            }
		        });
		        
		        if (!response.ok) {
		            throw new Error(`HTTP error! status: ${response.status}`);
		        }
		        
		        const data = await response.json();
		        
		        if (currentViewType === 'tasks') {
		            allData = data.map(task => ({
		                id: task.taskId,
		                taskName: task.taskName,
		                description: task.description,
		                status: task.status,
		                dueDate: task.dueDate,
		                assignedTo: task.assignedTo,
		                lead: task.lead ? { 
		                    contactName: task.lead.contactName,
		                    leadId: task.lead.leadId,
							leadOwnerEmail: task.lead.leadOwnerEmail
		                } : null,
		                createdTime: task.createdTime,
		                modifiedTime: task.modifiedTime,
		                lastViewed: task.lastViewed,
		                opportunity: task.oppurtunity,
		                reference: task.referenceLink
		            }));
		        } else if (currentViewType === 'contacts') {
		            allData = data.map(contact => ({
		                contactId: contact.contactID,
		                contactName: contact.lead ? contact.lead.contactName : 'N/A',
		                mobileNumber: contact.lead ? contact.lead.mobileNumber : 'N/A',
		                emailAddress: contact.lead ? contact.lead.emailAddress : 'N/A',
		                contactOwner: contact.lead ? contact.lead.leadOwner : 'N/A',
		                isBlocked: contact.isBloked,
		                isOptIn: contact.optIn,
		                companyName: 'N/A',
		                createdTime: contact.createdTime,  // Changed from createdDateTime
		                modifiedTime: contact.modifiedTime, // Changed from modifiedTimeDate
		                lastViewed: contact.lastViewed
		            }));
		        } 				else if (currentViewType === 'notes') {
				    // First create a map to remove duplicates by noteId
				    const notesMap = new Map();
				    data.forEach(note => {
				        if (note.noteID && !notesMap.has(note.noteID)) {
				            notesMap.set(note.noteID, note);
				        }
				    });
				    
				    // Convert back to array
				    const uniqueNotes = Array.from(notesMap.values());
				    
				    allData = uniqueNotes.map(note => ({
				        noteId: note.noteID,
				        Note: note.note,
				        createdBy: note.createdBy,
				        lead: note.lead ? { 
				            contactName: note.lead.contactName,
				            leadOwner: note.lead.leadOwner,
				            leadId: note.lead.leadId,
							leadOwnerEmail: note.lead.leadOwnerEmail 
				        } : null,
				        opportunity: note.opportunity,
				        createdTime: note.createdTime || note.createdDatetime,
				        modifiedTime: note.modifiedTime || note.modifiedDateTime,
				        lastViewed: note.lastViewed,
				        description: note.description
				    }));
				    
				    console.log('Processed notes data:', allData); // Debug log
				} else if (currentViewType === 'outbound') {
		            allData = data.map(mail => ({
		                mailId: mail.outBoundMailId,
		                toAddress: mail.toAddress,
		                ccAddress: mail.ccAddress,
		                bccAddress: mail.bccAdress,
		                subject: mail.subject,
		                emailBody: mail.body,
		                fromName: mail.fromName,
		                status: mail.status,
		                date: mail.date,
		                Reason: mail.reason,
		                createdUserName: mail.createdUserName,
		                createdTime: mail.emailCreatedTime, // Map to createdTime
		                modifiedTime: mail.modifiedTime,
		                lastViewed: mail.lastViewed
		            }));
		        }
		        
		        applyFilter();
		    } catch (error) {
		        console.error('Error fetching data:', error);
		        document.getElementById('no-data').style.display = 'block';
		        document.getElementById('no-data').textContent = 'Error loading data. Please try again.';
		        allData = [];
		        filteredData = [];
		    } finally {
		        hideLoading();
		    }
		}
        
        function applyFilter() {
            showLoading();
            setTimeout(() => {
            const filterValue = document.getElementById('data-filter').value;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (currentViewType === 'tasks') {
                filteredData = [...allData];
                
                if (filterValue === 'open') {
                    filteredData = filteredData.filter(task => 
                        task.status === 'PENDING' || task.status === 'IN_PROGRESS');
                } else if (filterValue === 'overdue') {
                    filteredData = filteredData.filter(task => {
                        const dueDate = new Date(task.dueDate);
                        return dueDate < today && task.status !== 'COMPLETED';
                    });
                } else if (filterValue === 'today') {
                    filteredData = filteredData.filter(task => {
                        const dueDate = new Date(task.dueDate);
                        dueDate.setHours(0, 0, 0, 0);
                        return dueDate.getTime() === today.getTime();
                    });
                } else if (filterValue === 'tomorrow') {
                    const tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    
                    filteredData = filteredData.filter(task => {
                        const dueDate = new Date(task.dueDate);
                        dueDate.setHours(0, 0, 0, 0);
                        return dueDate.getTime() === tomorrow.getTime();
                    });
                } else if (filterValue === 'next7days') {
                    const nextWeek = new Date(today);
                    nextWeek.setDate(nextWeek.getDate() + 7);
                    
                    filteredData = filteredData.filter(task => {
                        const dueDate = new Date(task.dueDate);
                        return dueDate >= today && dueDate <= nextWeek;
                    });
                }
            } 
            else if (currentViewType === 'contacts') {
                filteredData = [...allData];
                
                if (filterValue === 'recently_created') {
                    filteredData.sort((a, b) => new Date(b.createdDateTime) - new Date(a.createdDateTime));
                } else if (filterValue === 'recently_updated') {
                    filteredData.sort((a, b) => new Date(b.modifiedTimeDate) - new Date(a.modifiedTimeDate));
                }
            }
            else if (currentViewType === 'notes') {
                filteredData = [...allData];
                
                if (filterValue === 'recently_created') {
                    filteredData.sort((a, b) => new Date(b.createdDatetime) - new Date(a.createdDatetime));
                } else if (filterValue === 'recently_updated') {
                    filteredData.sort((a, b) => new Date(b.modifiedDateTime) - new Date(a.modifiedDateTime));
                }
            }
            else if (currentViewType === 'outbound') {
                filteredData = [...allData];
                
                if (filterValue === 'recently_created') {
                    filteredData.sort((a, b) => new Date(b.DateTime) - new Date(a.DateTime));
                } else if (filterValue === 'today') {
                    filteredData = filteredData.filter(mail => {
                        const mailDate = new Date(mail.DateTime);
                        mailDate.setHours(0, 0, 0, 0);
                        return mailDate.getTime() === today.getTime();
                    });
                }
            }
            
            totalRecords = filteredData.length;
            // Get current records per page selection
            const recordsPerPageSelect = document.getElementById('records-per-page');
            const value = recordsPerPageSelect.value;
    
            if (value === 'all') {
                recordsPerPage = filteredData.length;
            } else {
                recordsPerPage = parseInt(value);
            }

            totalPages = Math.ceil(totalRecords / recordsPerPage);
            
            // Update pagination controls
            updatePaginationControls();
            
            // Render the table
            renderTable();
            
            // Show no data message if applicable
            document.getElementById('no-data').style.display = filteredData.length === 0 ? 'block' : 'none';

            hideLoading();
        }, 100);
        }
        
		function renderTable() {
		    showLoading(); // Show loading indicator

		    setTimeout(() => {
		        const tableHeader = document.getElementById('table-header');
		        const tableBody = document.getElementById('table-body');
		        
		        // Clear existing content
		        tableHeader.innerHTML = '';
		        tableBody.innerHTML = '';
		        
		        // Set table headers based on view type
		        if (currentViewType === 'tasks') {
		            tableHeader.innerHTML = `
					<tr>
					           <th class="checkbox-cell">
					               <input type="checkbox" id="select-all" onchange="toggleSelectAll(this.checked)">
					           </th>
					           <th>Task Name</th>
					           <th>Description</th>
					           <th>Status</th>
					           <th>Due Date</th>
					           <th>Assigned To</th>
					           <th>Lead Owner Email</th>
					       </tr>
		            `;
		        } else if (currentViewType === 'contacts') {
		            tableHeader.innerHTML = `
		                <tr>
		                    <th class="checkbox-cell">
		                        <input type="checkbox" id="select-all" onchange="toggleSelectAll(this.checked)">
		                    </th>
		                    <th>Contact Name</th>
		                    <th>Mobile Number</th>
		                    <th>Email Address</th>
		                    <th>Contact Owner</th>
		                    <th>Company Name</th>
		                </tr>
		            `;
		        } else if (currentViewType === 'notes') {
		            tableHeader.innerHTML = `
					<tr>
				           <th class="checkbox-cell">
					               <input type="checkbox" id="select-all" onchange="toggleSelectAll(this.checked)">
					           </th>
					           <th>Note</th>
					           <th>Created By</th>
					           <th>Lead</th>
					           <th>Opportunity</th>
					           <th>Created Date</th>
					           <th>Contact Owner</th>
					       </tr>
		            `;
		        } else if (currentViewType === 'outbound') {
		            tableHeader.innerHTML = `
		                <tr>
		                    <th class="checkbox-cell">
		                        <input type="checkbox" id="select-all" onchange="toggleSelectAll(this.checked)">
		                    </th>
		                    <th>To Address</th>
		                    <th>Subject</th>
		                    <th>From Name</th>
		                    <th>Status</th>
		                    <th>Date Sent</th>
		                </tr>
		            `;
		        }
		        
		        // Calculate pagination bounds
		        const startIndex = (currentPage - 1) * recordsPerPage;
		        const endIndex = Math.min(startIndex + recordsPerPage, filteredData.length);
		        
		        // Create document fragment for better performance
		        const fragment = document.createDocumentFragment();
		        
		        // Add table rows
		        for (let i = startIndex; i < endIndex; i++) {
		            const item = filteredData[i];
		            if (!item) continue;
		            
		            const isSelected = selectedRecords.has(item.id || item.contactId || item.noteId || item.mailId);
		            const row = document.createElement('tr');
		            
					if (currentViewType === 'tasks') {
					    const dueDate = formatDateTime(item.dueDate);
					    const leadOwnerEmail = item.lead?.leadOwnerEmail || '-';
					    row.innerHTML = `
					        <td class="checkbox-cell">
					            <input type="checkbox" ${isSelected ? 'checked' : ''} 
					                onchange="toggleSelectRecord('${item.id}', this.checked)">
					        </td>
					        <td>${item.taskName}</td>
					        <td>${item.description}</td>
					        <td>${item.status}</td>
					        <td>${dueDate}</td>
					        <td>${item.assignedTo}</td>
					        <td>${leadOwnerEmail}</td>
					    `;
					} else if (currentViewType === 'contacts') {
		                row.innerHTML = `
		                    <td class="checkbox-cell">
		                        <input type="checkbox" ${isSelected ? 'checked' : ''} 
		                            onchange="toggleSelectRecord('${item.contactId}', this.checked)">
		                    </td>
		                    <td>${item.contactName}</td>
		                    <td>${item.mobileNumber}</td>
		                    <td>${item.emailAddress}</td>
		                    <td>${item.contactOwner}</td>
		                    <td>${item.companyName}</td>
		                `;
		            } 					else if (currentViewType === 'notes') {
					    const leadDisplay = item.lead ? 
					        (item.lead.contactName || item.lead.leadOwner || 'N/A') : 
					        'N/A';
					    const createdDate = formatDateTime(item.createdTime || item.createdDatetime);
					    const contactOwnerEmail = item.lead?.leadOwnerEmail || '-';
					    
					    row.innerHTML = `
					        <td class="checkbox-cell">
					            <input type="checkbox" ${isSelected ? 'checked' : ''} 
					                onchange="toggleSelectRecord('${item.noteId}', this.checked)">
					        </td>
					        <td>${item.Note || '-'}</td>
					        <td>${item.createdBy || '-'}</td>
					        <td>${leadDisplay}</td>
					        <td>${item.opportunity || '-'}</td>
					        <td>${createdDate || '-'}</td>
					        <td>${contactOwnerEmail}</td>
					    `;
					} else if (currentViewType === 'outbound') {
		                const sentDate = formatDateTime(item.DateTime);
		                row.innerHTML = `
		                    <td class="checkbox-cell">
		                        <input type="checkbox" ${isSelected ? 'checked' : ''} 
		                            onchange="toggleSelectRecord('${item.mailId}', this.checked)">
		                    </td>
		                    <td>${item.toAddress}</td>
		                    <td>${item.subject}</td>
		                    <td>${item.fromName}</td>
		                    <td>${item.status}</td>
		                    <td>${sentDate}</td>
		                `;
		            }
		            
		            fragment.appendChild(row);
		        }
		        
		        tableBody.appendChild(fragment);
		        
		        // Update select all checkbox state
		        updateSelectAllCheckbox();
		        hideLoading(); // Hide loading indicator when done
		        
		        setupRowClickHandlers();
		    }, 50);
		}
        
        function toggleSelectAll(checked) {
            // Get all records on current page
            const startIndex = (currentPage - 1) * recordsPerPage;
            const endIndex = Math.min(startIndex + recordsPerPage, filteredData.length);
            
            for (let i = startIndex; i < endIndex; i++) {
                const record = filteredData[i];
                const recordId = record.id || record.contactId || record.noteId || record.mailId;
                if (checked) {
                    selectedRecords.add(recordId);
                } else {
                    selectedRecords.delete(recordId);
                }
            }
            
            // Re-render table to update checkboxes
            renderTable();
        }
        
        function toggleSelectRecord(recordId, checked) {
            if (checked) {
                selectedRecords.add(recordId);
            } else {
                selectedRecords.delete(recordId);
            }
            updateSelectAllCheckbox();
        }
        
        function updateSelectAllCheckbox() {
            const selectAllCheckbox = document.getElementById('select-all');
            if (!selectAllCheckbox) return;
            
            // Get all records on current page
            const startIndex = (currentPage - 1) * recordsPerPage;
            const endIndex = Math.min(startIndex + recordsPerPage, filteredData.length);
            const pageRecords = filteredData.slice(startIndex, endIndex);
            
            // Check if all records on page are selected
            const allSelected = pageRecords.every(record => {
                const recordId = record.id || record.contactId || record.noteId || record.mailId;
                return selectedRecords.has(recordId);
            });
            
            selectAllCheckbox.checked = allSelected;
            selectAllCheckbox.indeterminate = !allSelected && 
                pageRecords.some(record => {
                    const recordId = record.id || record.contactId || record.noteId || record.mailId;
                    return selectedRecords.has(recordId);
                });
        }
        
        function updatePaginationControls() {
            // Update page info
            document.getElementById('page-info').textContent = `Page ${currentPage} of ${totalPages}`;
            
            // Enable/disable pagination buttons
            document.getElementById('first-page').disabled = currentPage === 1;
            document.getElementById('prev-page').disabled = currentPage === 1;
            document.getElementById('next-page').disabled = currentPage === totalPages || totalPages === 0;
            document.getElementById('last-page').disabled = currentPage === totalPages || totalPages === 0;
        }
        
        function changeRecordsPerPage() {
            showLoading(); // Show loading indicator
    
            setTimeout(() => {
            const recordsPerPageSelect = document.getElementById('records-per-page');
            const value = recordsPerPageSelect.value;
        
            if (value === 'all') {
                recordsPerPage = filteredData.length; // Show all records
            } else {
                recordsPerPage = parseInt(value);
            }
        
            currentPage = 1; // Reset to first page
            totalPages = Math.ceil(totalRecords / recordsPerPage);
        
            // Update pagination controls and render table
            updatePaginationControls();
            renderTable();
            
            hideLoading(); // Hide loading indicator when done
            }, 100); // Small timeout to ensure smooth UI update
        }
        
        function goToPage(page) {
        if (page === 'last') {
            page = totalPages; // Go to the last page
        }
        if (page >= 1 && page <= totalPages) {
            currentPage = page;
            renderTable();
            updatePaginationControls();
        }
    }
        
        function goToPreviousPage() {
            if (currentPage > 1) {
                currentPage--;
                renderTable();
                updatePaginationControls();
            }
        }
        
        function goToNextPage() {
            if (currentPage < totalPages) {
                currentPage++;
                renderTable();
                updatePaginationControls();
            }
        }
        
        function refreshData() {
            fetchData();
        }
        
        function goBack() {
            document.getElementById('data-section').style.display = 'none';
            document.querySelector('.form-container').style.display = 'grid';
            document.querySelector('.container h2').textContent = 'Custom Forms';
			
			// Reset Add button visibility when going back
			    document.getElementById('add-button').style.display = 'inline-block';
        }
        
        
		
		
		/*   ********* view ************** */
		
		
		// Initialize detail view (call this in DOMContentLoaded)
		// Initialize detail view
		function initializeDetailView() {
		  // Make sure to remove any existing listeners first
		  const addButton = document.getElementById('add-button');
		  const saveButton = document.getElementById('detail-save');
		  
		  // Remove existing listeners
		  addButton?.replaceWith(addButton.cloneNode(true));
		  saveButton?.replaceWith(saveButton.cloneNode(true));

		  // Get fresh references after cloning
		  const freshAddButton = document.getElementById('add-button');
		  const freshSaveButton = document.getElementById('detail-save');

		  // Add event listeners
		  freshAddButton?.addEventListener('click', openAddForm);
		  freshSaveButton?.addEventListener('click', saveRecord);

		  // Other existing listeners...
		  document.getElementById('detail-back')?.addEventListener('click', closeDetailView);
		  document.getElementById('detail-prev')?.addEventListener('click', () => navigateDetailRecord('prev'));
		  document.getElementById('detail-next')?.addEventListener('click', () => navigateDetailRecord('next'));
		  document.getElementById('detail-delete')?.addEventListener('click', deleteDetailRecord);
		  document.getElementById('detail-edit')?.addEventListener('click', enableEditMode);
		  document.getElementById('detail-cancel')?.addEventListener('click', cancelEdit);
		}

		// Show detail view for a record
		// Show detail view for a record
		function showDetailView(index) {
		  currentDetailIndex = index;
		  currentDetailRecords = filteredData;
		  currentDetailViewType = currentViewType;
		  
		  // Update this part to show edit button for both tasks and notes
		   document.getElementById('detail-edit').style.display = 
		     (currentViewType === 'tasks' || currentViewType === 'notes') ? 'inline-block' : 'none';
		   
		  
			 // Show the existing lastViewed time (don't update UI yet)
			     updateDetailView();
			     
			     // Update lastViewed time in background
			     updateLastViewedTime();
			     
			     // Show the overlay
			     document.getElementById('detail-view-overlay').style.display = 'block';
			     document.body.style.overflow = 'hidden';
			     
			     // Update the counter
			     updateDetailCounter();
		}

		// Close detail view
		function closeDetailView() {
		    // Reset all modes and states
		    isEditMode = false;
		    isAddMode = false;
		    currentRecordData = null;
		    originalTaskData = null;
		    
		    // Hide the overlay
		    document.getElementById('detail-view-overlay').style.display = 'none';
		    document.body.style.overflow = '';
		    
		    // Reset button states
		    document.getElementById('detail-edit').style.display = 
		        (currentViewType === 'tasks' || currentViewType === 'notes') ? 'inline-block' : 'none';
		    document.getElementById('detail-delete').style.display = 'inline-block';
		    document.getElementById('detail-save').style.display = 'none';
		    document.getElementById('detail-cancel').style.display = 'none';
		    document.getElementById('detail-back').style.display = 'inline-block';
		    
		    // Show navigation buttons
		    document.getElementById('detail-prev').style.display = 'inline-block';
		    document.getElementById('detail-next').style.display = 'inline-block';
		    document.getElementById('detail-counter').style.display = 'inline-block';
		}


		
		function updateLastViewedTime() {
		    const record = currentDetailRecords[currentDetailIndex];
		    if (!record) return;

		    let endpoint, recordId;
		    
		    switch (currentViewType) {
		        case 'tasks':
		            recordId = record.id;
		            endpoint = `/api/tasks/${recordId}/view`;
		            break;
		        case 'notes':
		            recordId = record.noteId;
		            endpoint = `/api/notes/${recordId}/view`;
		            break;
		        case 'contacts':
		            recordId = record.contactId;
		            endpoint = `/api/contacts/${recordId}/view`;
		            break;
		        case 'outbound':
		            recordId = record.mailId;
		            endpoint = `/api/outbound-mails/${recordId}/view`;
		            break;
		        default:
		            return;
		    }

		    if (!recordId) return;

		    // Send update request but DON'T update the UI
		    fetch(endpoint, {
		        method: 'PATCH',
		        headers: {
		            'Content-Type': 'application/json'
		        }
		    })
		    .then(response => {
		        if (!response.ok) throw new Error('Failed to update last viewed time');
		        // Success - the database is updated but we don't change the UI
		    })
		    .catch(error => {
		        console.error('Error updating last viewed time:', error);
		    });
		}
		
		
		// Update the detail view content
		function updateDetailView() {
			const record = currentRecordData || currentDetailRecords[currentDetailIndex];
			  if (!record) return;

			  // Set the title
			    const title = isAddMode ? `Add New ${currentViewType.slice(0, -1)}` : 
			                `${currentViewType.charAt(0).toUpperCase() + currentViewType.slice(1)} Details`;
			    document.getElementById('detail-view-title').textContent = title;
		  
				// Generate content based on view type
				  let content = '';
				  
				  if (currentViewType === 'tasks') {
				    content = `
				      <div class="section">
				        <div class="field">
				          <div class="field-label">Task Name</div>
				          <div class="field-value">
				            ${isEditMode || isAddMode ? 
				              `<input type="text" id="edit-taskName" value="${record.taskName || ''}" class="editable-input">` : 
				              record.taskName || '-'}
				          </div>
				        </div>
				      </div>
				      
				      <div class="section">
				        <div class="section-header">Task Information</div>
				        <div class="two-column-fields">
				          <div class="two-column-field">
				            <div class="field">
				              <div class="field-label">Created At</div>
				              <div class="field-value">${isAddMode ? '-' : formatDateTime(record.createdTime) || '-'}</div>
				            </div>
							
							<div class="field">
							  <div class="field-label">Assigned To</div>
							  <div class="field-value">
							    ${isEditMode || isAddMode ? 
							      `<input type="text" id="edit-assignedTo" value="${record.assignedTo || ''}" class="editable-input">
							       <span class="user-icon" onclick="openUserSelection('edit-assignedTo')">👤</span>` : 
							      record.assignedTo || '-'}
							  </div>
							</div>
							<div class="field">
								<div class="field-label">Lead Owner Email</div>
								 <div class="field-value">
									<input type="text" id="edit-leadOwnerEmail" value="${record.lead?.leadOwnerEmail || ''}" class="readonly-input" readonly>
								</div>
							 </div>
				          </div>
				          <div class="two-column-field">
						  <div class="field">
						      <div class="field-label">Lead</div>
						      <div class="field-value">
						          ${isEditMode || isAddMode ? 
						              `<input type="text" id="edit-lead" value="${record.lead?.contactName || ''}" class="editable-input">
						               <span class="user-icon" onclick="openLeadSelection('edit-lead')">👤</span>
						               <input type="hidden" id="edit-leadId" value="${record.leadId || ''}">` : 
						              record.lead?.contactName || '-'}
						      </div>
						  </div>
						  
				            <div class="field">
				              <div class="field-label">Due On</div>
				              <div class="field-value">
				                ${isEditMode || isAddMode ? 
				                  `<input type="datetime-local" id="edit-dueDate" value="${formatDateTimeForInput(record.dueDate)}" class="editable-input">` : 
				                  formatDateTime(record.dueDate) || '-'}
				              </div>
				            </div>
				            <div class="field">
				              <div class="field-label">Status</div>
				              <div class="field-value">
				                ${isEditMode || isAddMode ? 
									`<select id="edit-status" class="editable-select">
									    <option value="OPEN" ${record.status === 'OPEN' ? 'selected' : ''}>Open</option>
									    <option value="OVERDUE" ${record.status === 'OVERDUE' ? 'selected' : ''}>Overdue</option>
									    <option value="CLOSED" ${record.status === 'CLOSED' ? 'selected' : ''}>Closed</option>
									</select>` : 
				                  record.status || '-'}
				              </div>
				            </div>
				          </div>
				        </div>
				      </div>
				      
				      <div class="section">
				        <div class="section-header">Description</div>
				        <div class="field">
				          <div class="field-value">
				            ${isEditMode || isAddMode ? 
				              `<textarea id="edit-description" class="editable-textarea">${record.description || ''}</textarea>` : 
				              record.description || '-'}
				          </div>
				        </div>
				      </div>
				      
				      <div class="section">
				        <div class="section-header">Reference Link</div>
				        <div class="field">
				          <div class="field-value">
				            ${isEditMode || isAddMode ? 
				              `<input type="text" id="edit-reference" value="${record.reference || ''}" class="editable-input">` : 
				              record.reference ? `<a href="${record.reference}" target="_blank">${record.reference}</a>` : '-'}
				          </div>
				        </div>
				      </div>
				    `;
				  } 				// In updateDetailView() for notes section:
				else if (currentViewType === 'notes') {
				    content = `
				        <div class="section">
				            <div class="field">
				                <div class="field-label">Note</div>
				                <div class="field-value">
				                    ${isEditMode || isAddMode ? 
				                        `<textarea id="edit-Note" class="editable-textarea">${record.Note || ''}</textarea>` : 
				                        record.Note || '-'}
				                </div>
				            </div>
				        </div>
				        
				        <div class="section">
				            <div class="section-header">Note Information</div>
				            <div class="two-column-fields">
				                <div class="two-column-field">
				                    <div class="field">
				                        <div class="field-label">Created By</div>
				                        <div class="field-value">
				                            ${isEditMode || isAddMode ? 
				                                `<input type="text" id="edit-createdBy" value="${record.createdBy || ''}" class="editable-input">
				                                 <span class="user-icon" onclick="openUserSelection('edit-createdBy')">👤</span>` : 
				                                record.createdBy || '-'}
				                        </div>
				                    </div>
				                    <div class="field">
				                        <div class="field-label">Lead</div>
				                        <div class="field-value">
				                            ${isEditMode || isAddMode ? 
				                                `<input type="text" id="edit-lead" value="${record.lead?.contactName || record.lead?.leadOwner || ''}" class="editable-input">
				                                 <span class="user-icon" onclick="openLeadSelection('edit-lead')">👤</span>
				                                 <input type="hidden" id="edit-leadId" value="${record.lead?.leadId || ''}">` : 
				                                (record.lead?.contactName || record.lead?.leadOwner || '-')}
				                        </div>
				                    </div>
									<div class="field">
									                        <div class="field-label">Contact Owner</div>
									                        <div class="field-value">
									                            <input type="text" id="edit-contactOwner" value="${record.lead?.leadOwnerEmail || ''}" class="readonly-input" readonly>
									                        </div>
									                    </div>
				                </div>
				                <div class="two-column-field">
				                    <div class="field">
				                        <div class="field-label">Opportunity</div>
				                        <div class="field-value">
				                            ${isEditMode || isAddMode ? 
				                                `<input type="text" id="edit-opportunity" value="${record.opportunity || ''}" class="editable-input">` : 
				                                record.opportunity || '-'}
				                        </div>
				                    </div>
				                    <div class="field">
				                        <div class="field-label">Created Date</div>
				                        <div class="field-value">${isAddMode ? '-' : formatDateTime(record.createdTime || record.createdDatetime) || '-'}</div>
				                    </div>
				                </div>
				            </div>
				        </div>
				    `;
				}
		  else if (currentViewType === 'contacts') {
		    content = `
		      <div class="section">
		        <div class="section-header">Contact Information</div>
		        <div class="two-column-fields">
		          <div class="two-column-field">
		            <div class="field">
		              <div class="field-label">Contact Name</div>
		              <div class="field-value">${record.contactName || '-'}</div>
		            </div>
		            <div class="field">
		              <div class="field-label">Mobile Number</div>
		              <div class="field-value">
		                ${record.mobileNumber || '-'}
		                ${record.mobileNumber ? `<button class="whatsapp-button" title="Message on WhatsApp">
		                  <img src="/images/whatsapp-icon.png" alt="WhatsApp" 
		                       onerror="this.src='https://cdn-icons-png.flaticon.com/512/3670/3670051.png'">
		                </button>` : ''}
		              </div>
		            </div>
		            <div class="field">
		              <div class="field-label">Email Address</div>
		              <div class="field-value">
		                ${record.emailAddress ? `<a href="mailto:${record.emailAddress}" class="email-link">${record.emailAddress}</a>` : '-'}
		              </div>
		            </div>
		          </div>
		          <div class="two-column-field">
		            <div class="field">
		              <div class="field-label">Contact Owner</div>
		              <div class="field-value">${record.contactOwner || '-'}</div>
		            </div>
		            <div class="field">
		              <div class="field-label">Company Name</div>
		              <div class="field-value">${record.companyName || '-'}</div>
		            </div>
		            <div class="field">
		              <div class="field-label">Opt-In Status</div>
		              <div class="field-value">${record.isOptIn ? 'Opted In' : 'Not Opted In'}</div>
		            </div>
		          </div>
		        </div>
		      </div>
		    `;
		  }
		  else if (currentViewType === 'notes') {
		    content = `
		      <div class="section">
		        <div class="section-header">Note Information</div>
		        <div class="two-column-fields">
		          <div class="two-column-field">
		            <div class="field">
		              <div class="field-label">Created By</div>
		              <div class="field-value">${record.createdBy || '-'}</div>
		            </div>
		            <div class="field">
		              <div class="field-label">Lead</div>
		              <div class="field-value">${record.lead || '-'}</div>
		            </div>
		          </div>
		          <div class="two-column-field">
		            <div class="field">
		              <div class="field-label">Opportunity</div>
		              <div class="field-value">${record.opportunity || '-'}</div>
		            </div>
		            <div class="field">
		              <div class="field-label">Created Date</div>
		              <div class="field-value">${formatDateTime(record.createdDatetime) || '-'}</div>
		            </div>
		          </div>
		        </div>
		      </div>
		      
		      <div class="section">
		        <div class="section-header">Note Content</div>
		        <div class="field">
		          <div class="field-value">${record.Note || '-'}</div>
		        </div>
		      </div>
		    `;
		  }
		  else if (currentViewType === 'outbound') {
		    content = `
		      <div class="section">
		        <div class="section-header">Outbound Mail Information</div>
		        <div class="two-column-fields">
		          <div class="two-column-field">
		            <div class="field">
		              <div class="field-label">To Address</div>
		              <div class="field-value">${record.toAddress || '-'}</div>
		            </div>
		            <div class="field">
		              <div class="field-label">Subject</div>
		              <div class="field-value">${record.subject || '-'}</div>
		            </div>
		            <div class="field">
		              <div class="field-label">From Name</div>
		              <div class="field-value">${record.fromName || '-'}</div>
		            </div>
		          </div>
		          <div class="two-column-field">
		            <div class="field">
		              <div class="field-label">Status</div>
		              <div class="field-value">${record.status || '-'}</div>
		            </div>
		            <div class="field">
		              <div class="field-label">Date Sent</div>
		              <div class="field-value">${formatDateTime(record.DateTime) || '-'}</div>
		            </div>
		            <div class="field">
		              <div class="field-label">Created By</div>
		              <div class="field-value">${record.createdUserName || '-'}</div>
		            </div>
		          </div>
		        </div>
		      </div>
		      
		      <div class="section">
		        <div class="section-header">Email Body</div>
		        <div class="field">
		          <div class="field-value">${record.emailBody || '-'}</div>
		        </div>
		      </div>
		    `;
		  }

		  // Update timestamps (not in add mode)
		     if (!isAddMode) {
		         // Use consistent field names across all record types
		         const createdTime = formatDateTime(record.createdTime);
		         const modifiedTime = formatDateTime(record.modifiedTime);
		         const lastViewed = formatDateTime(record.lastViewed);
		         
		         document.getElementById('detail-created-time').textContent = 
		             `Created Time: ${createdTime || '-'}`;
		         document.getElementById('detail-modified-time').textContent = 
		             `Modified Time: ${modifiedTime || '-'}`;
		         document.getElementById('detail-last-viewed').textContent = 
		             `Last Viewed Time: ${lastViewed || '-'}`;
		     } else {
		         document.getElementById('detail-created-time').textContent = 'Created Time: -';
		         document.getElementById('detail-modified-time').textContent = 'Modified Time: -';
		         document.getElementById('detail-last-viewed').textContent = 'Last Viewed Time: -';
		     }
			 

		    // Insert the content
		    document.getElementById('detail-view-content').innerHTML = content;
		  
		  }

		// Navigate between detail records
		function navigateDetailRecord(direction) {
		  if (direction === 'prev' && currentDetailIndex > 0) {
		    currentDetailIndex--;
		  } else if (direction === 'next' && currentDetailIndex < currentDetailRecords.length - 1) {
		    currentDetailIndex++;
		  }
		  
		  updateDetailView();
		  updateDetailCounter();
		}

		// Update the navigation counter
		function updateDetailCounter() {
		  document.getElementById('detail-counter').textContent = 
		    `${currentDetailIndex + 1}/${currentDetailRecords.length}`;
		}

		// Edit the current detail record (only for tasks)
		function editDetailRecord() {
		  if (currentDetailViewType === 'tasks') {
		    // Implement task edit functionality here
		    alert('Task edit functionality would be implemented here');
		  }
		}

		// Delete the current detail record
		function deleteDetailRecord() {
		  if (confirm('Are you sure you want to delete this record?')) {
		    // Implement delete functionality
		    const recordId = currentDetailRecords[currentDetailIndex].id || 
		                    currentDetailRecords[currentDetailIndex].contactId || 
		                    currentDetailRecords[currentDetailIndex].noteId || 
		                    currentDetailRecords[currentDetailIndex].mailId;
		    
		    // Example API call (adjust endpoint as needed)
		    fetch(`/api/${currentDetailViewType}/${recordId}`, {
		      method: 'DELETE'
		    })
		    .then(response => {
		      if (!response.ok) throw new Error('Delete failed');
		      closeDetailView();
		      fetchData(); // Refresh the table
		    })
		    .catch(error => {
		      console.error('Delete error:', error);
		      alert('Failed to delete record');
		    });
		  }
		}

		// Modify your row click handler to use this detail view
		function setupRowClickHandlers() {
		  const rows = document.querySelectorAll('#table-body tr');
		  rows.forEach((row, index) => {
		    // Skip checkbox cells
		    row.addEventListener('click', (event) => {
		      if (event.target.tagName === 'INPUT' && event.target.type === 'checkbox') {
		        return;
		      }
		      
		      const globalIndex = (currentPage - 1) * recordsPerPage + index;
		      if (globalIndex < filteredData.length) {
		        showDetailView(globalIndex);
		      }
		    });
		  });
		}

		

		// Initialize when DOM is loaded
		document.addEventListener('DOMContentLoaded', function() {
		  initializeDetailView();
		  // Initialize popups (call this in DOMContentLoaded)
		  function initializePopups() {
		    // User popup search functionality
		    document.getElementById('userSearch').addEventListener('input', function(e) {
		      const searchTerm = e.target.value.toLowerCase();
		      const rows = document.querySelectorAll('#userList tr');
		      
		      rows.forEach(row => {
		        const name = row.cells[0].textContent.toLowerCase();
		        row.style.display = name.includes(searchTerm) ? '' : 'none';
		      });
		    });

		    // Lead popup search functionality
		    document.getElementById('leadSearch').addEventListener('input', function(e) {
		      const searchTerm = e.target.value.toLowerCase();
		      const rows = document.querySelectorAll('#leadList tr');
		      
		      rows.forEach(row => {
		        const name = row.cells[0].textContent.toLowerCase();
		        row.style.display = name.includes(searchTerm) ? '' : 'none';
		      });
		    });
		  }

		});
		
		// Enable edit mode
		function enableEditMode() {
		    isEditMode = true;
		    const record = currentDetailRecords[currentDetailIndex];
		    originalTaskData = {...record};
		    
		    // Start loading users and leads in background if not already loaded
		    loadUsersAndLeadsInBackground();
		    
		    // Update the view first to show editable fields
		    updateDetailView();
		    
		    // Then set the initial values for all fields
		    if (currentViewType === 'tasks') {
		        document.getElementById('edit-taskName').value = record.taskName || '';
		        document.getElementById('edit-description').value = record.description || '';
		        document.getElementById('edit-status').value = record.status || 'PENDING';
		        document.getElementById('edit-dueDate').value = formatDateTimeForInput(record.dueDate);
		        document.getElementById('edit-assignedTo').value = record.assignedTo || '';
		        document.getElementById('edit-reference').value = record.reference || '';
		        
		        // Handle lead field
		        if (record.lead) {
		            document.getElementById('edit-lead').value = record.lead.contactName || '';
		            document.getElementById('edit-leadId').value = record.lead.leadId || '';
		        }
		    } 
		    else if (currentViewType === 'notes') {
		        document.getElementById('edit-Note').value = record.Note || '';
		        document.getElementById('edit-description').value = record.description || '';
		        document.getElementById('edit-createdBy').value = record.createdBy || '';
		        document.getElementById('edit-opportunity').value = record.opportunity || '';
		        
		        // Handle lead field for notes
		        if (record.lead) {
		            document.getElementById('edit-lead').value = record.lead.contactName || '';
		            document.getElementById('edit-leadId').value = record.lead.leadId || '';
		        }
		    }
		    
		    // Update button visibility through updateDetailView
		    updateDetailView();
		}

		// Cancel edit mode
		function cancelEdit() {
		    if (isAddMode) {
		        // For add mode, just close the detail view
		        closeDetailView();
		    } else {
		        // For edit mode, restore original data
		        if (originalTaskData) {
		            currentDetailRecords[currentDetailIndex] = originalTaskData;
		        }
		    }
		    
		    // Reset modes
		    isEditMode = false;
		    isAddMode = false;
		    currentRecordData = null;
		    originalTaskData = null;
		    
		    // Update the view (will reset to view mode)
		    updateDetailView();
		}

		// Save task changes
		async function saveRecord() {
		    const saveBtn = document.getElementById('detail-save');
		    saveBtn.disabled = true;
		    saveBtn.innerHTML = '⏳ Saving...';

		    try {
		        let endpoint, requestData, method;

		        if (currentViewType === 'tasks') {
		            if (isAddMode) {
		                endpoint = '/api/tasks';
		                method = 'POST';
		            } else {
		                endpoint = `/api/tasks/${currentDetailRecords[currentDetailIndex].id}`;
		                method = 'PUT';
		            }
		            
		            requestData = {
		                taskName: document.getElementById('edit-taskName')?.value || '',
		                description: document.getElementById('edit-description')?.value || '',
		                status: document.getElementById('edit-status')?.value || 'PENDING',
		                dueDate: document.getElementById('edit-dueDate')?.value || '',
		                assignedTo: document.getElementById('edit-assignedTo')?.value || '',
		                reference: document.getElementById('edit-reference')?.value || ''
		            };

		            const leadId = document.getElementById('edit-leadId')?.value;
		            if (leadId) {
		                requestData.lead = { leadId: leadId };
		            }
		        } 
		        else if (currentViewType === 'notes') {
		            if (isAddMode) {
		                endpoint = '/api/notes';
		                method = 'POST';
		            } else {
		                endpoint = `/api/notes/${currentDetailRecords[currentDetailIndex].noteId}`;
		                method = 'PUT';
		            }
		            
		            requestData = {
		                note: document.getElementById('edit-Note')?.value || '',
		                description: document.getElementById('edit-description')?.value || '',
		                createdBy: document.getElementById('edit-createdBy')?.value || '',
		                opportunity: document.getElementById('edit-opportunity')?.value || ''
		            };

		            const leadId = document.getElementById('edit-leadId')?.value;
		            if (leadId) {
		                requestData.lead = { leadId: leadId };
		            }
		        }

		        console.log("Sending data to backend:", requestData); // Debug log

		        const response = await fetch(endpoint, {
		            method: method,
		            headers: {
		                'Content-Type': 'application/json'
		            },
		            body: JSON.stringify(requestData)
		        });

		        if (!response.ok) {
		            const errorText = await response.text();
		            throw new Error(errorText || 'Failed to save record');
		        }

		        // Reset modes and close
				isEditMode = false;
				isAddMode = false;
				currentRecordData = null;
				originalTaskData = null;
		        
		        closeDetailView();
		        fetchData(); // Refresh the data

		    } catch (error) {
		        console.error('Save error:', error);
		        alert('Failed to save: ' + error.message);
		    } finally {
		        saveBtn.innerHTML = '💾 Save';
		        saveBtn.disabled = false;
		    }
		}	
		// Format datetime for input field
		function formatDateTimeForInput(isoString) {
		  if (!isoString) return '';
		  const date = new Date(isoString);
		  if (isNaN(date.getTime())) return '';
		  
		  // Format: YYYY-MM-DDTHH:MM
		  const pad = num => num.toString().padStart(2, '0');
		  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
		}
		
		
		// Open user selection popup for assigned to field
		// Update user selection with loading indicator
		function openUserSelection(fieldId) {
		    currentSelectionField = fieldId;
		    const userList = document.getElementById("userList");
		    const userLoading = document.getElementById("userLoading");
		    
		    // Show loading
		    userList.innerHTML = '';
		    userLoading.style.display = 'flex';
		    document.getElementById("userPopup").style.display = "flex";

		    // Check if we have cached data
		    if (cachedUsers) {
		        populateUserList(userList, cachedUsers);
		        userLoading.style.display = 'none';
		    } else {
		        // Fallback to original loading if cache is empty
		        fetch("http://localhost:8085/api/getUsers")
		            .then(response => response.json())
		            .then(users => {
		                cachedUsers = users;
		                populateUserList(userList, users);
		                userLoading.style.display = 'none';
		            })
		            .catch(error => {
		                console.error("Error fetching users:", error);
		                userLoading.style.display = 'none';
		                userList.innerHTML = `<tr><td colspan="3" style="text-align: center; color: red;">Error loading users</td></tr>`;
		            });
		    }
		}

		function openLeadSelection(fieldId) {
		    currentSelectionField = fieldId;
		    const leadList = document.getElementById("leadList");
		    const leadLoading = document.getElementById("leadLoading");
		    
		    leadList.innerHTML = '';
		    leadLoading.style.display = 'flex';
		    document.getElementById("leadPopup").style.display = "flex";

		    if (cachedLeads) {
		        populateLeadList(leadList, cachedLeads);
		        leadLoading.style.display = 'none';
		    } else {
		        fetch("http://localhost:8085/api/leads/all")
		            .then(response => response.json())
		            .then(leads => {
		                cachedLeads = leads;
		                populateLeadList(leadList, leads);
		                leadLoading.style.display = 'none';
		            })
		            .catch(error => {
		                console.error("Error fetching leads:", error);
		                leadLoading.style.display = 'none';
		                leadList.innerHTML = `<tr><td colspan="4">Error loading leads</td></tr>`;
		            });
		    }
		}

		function populateLeadList(leadList, leads) {
		    leads.forEach(lead => {
		        const row = document.createElement("tr");
		        row.innerHTML = `
		            <td>${lead.contactName || 'N/A'}</td>
		            <td>${lead.mobileNumber || 'N/A'}</td>
		            <td>${lead.leadOwnerEmail || 'N/A'}</td>
		            <td>${lead.leadStage || 'N/A'}</td>
		        `;
		        row.addEventListener("click", function() {
		            // Update lead field
		            document.getElementById('edit-lead').value = lead.contactName || lead.leadOwner || 'N/A';
		            document.getElementById('edit-leadId').value = lead.leadId || '';
		            
		            // Update owner email field based on view type
		            if (currentViewType === 'tasks') {
		                document.getElementById('edit-leadOwnerEmail').value = lead.leadOwnerEmail || '';
		            } else if (currentViewType === 'notes') {
		                document.getElementById('edit-contactOwner').value = lead.leadOwnerEmail || '';
		            }
		            
		            closeLeadPopup();
		        });
		        leadList.appendChild(row);
		    });
		}
		

		// Helper functions to populate the lists
		function populateUserList(userList, users) {
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
		            document.getElementById(currentSelectionField).value = user.username;
		            closeUserPopup();
		        });
		        userList.appendChild(row);
		    });
		}

		
		// Close popups
		function closeUserPopup() {
		  document.getElementById("userPopup").style.display = "none";
		}

		function closeLeadPopup() {
		  document.getElementById("leadPopup").style.display = "none";
		}

		// Update your edit mode HTML to include leadId field
		function enableEditMode() {
		  isEditMode = true;
		  originalTaskData = {...currentDetailRecords[currentDetailIndex]};
		  
		  // Update the view with editable fields
		  updateDetailView();
		  
		  // Switch buttons
		  document.getElementById('detail-edit').style.display = 'none';
		  document.getElementById('detail-delete').style.display = 'none';
		  document.getElementById('detail-save').style.display = 'inline-block';
		  document.getElementById('detail-cancel').style.display = 'inline-block';
		}


		
		// open create notes/tasks forms by clicking on the add buttun
		// Open form for adding new record
		function openAddForm() {
		    console.log("open form clicked");
		    isAddMode = true;
		    isEditMode = true;
		    
		    // Create empty record
		    currentRecordData = {};
		    
		    if (currentViewType === 'tasks') {
		        currentRecordData = {
		            taskName: '',
		            description: '',
		            status: 'PENDING',
		            dueDate: '',
		            assignedTo: '',
		            lead: null,
		            leadId: '',
		            reference: ''
		        };
		    } 
		    else if (currentViewType === 'notes') {
		        currentRecordData = {
		            Note: '',
		            description: '',
		            createdBy: '',
		            lead: null,
		            leadId: '',
		            opportunity: ''
		        };
		    }
		    
		    // Start loading users and leads in background
		    loadUsersAndLeadsInBackground();
		    
		    // Update UI
		    updateDetailView();
		    
		    // Show/hide appropriate buttons
		    document.getElementById('detail-edit').style.display = 'none';
		    document.getElementById('detail-delete').style.display = 'none';
		    document.getElementById('detail-save').style.display = 'inline-block';
		    document.getElementById('detail-cancel').style.display = 'inline-block';
		    
		    // Hide navigation in add mode
		    document.getElementById('detail-prev').style.display = 'none';
		    document.getElementById('detail-next').style.display = 'none';
		    document.getElementById('detail-counter').style.display = 'none';
		    
		    // Show the overlay
		    document.getElementById('detail-view-overlay').style.display = 'block';
		    document.body.style.overflow = 'hidden';
		}

		function loadUsersAndLeadsInBackground() {
		    // Show loading indicators if data isn't cached
		    if (!cachedUsers && !usersLoading) {
		        usersLoading = true;
		        fetch("http://localhost:8085/api/getUsers")
		            .then(response => response.json())
		            .then(users => {
		                cachedUsers = users;
		                usersLoading = false;
		                
		                // If we're in edit mode, update any user fields
		                if (isEditMode || isAddMode) {
		                    const assignedTo = document.getElementById('edit-assignedTo');
		                    const createdBy = document.getElementById('edit-createdBy');
		                    
		                    if (assignedTo && assignedTo.value && !assignedTo.value.trim()) {
		                        // Set default user if field is empty
		                        assignedTo.value = users[0]?.username || '';
		                    }
		                    
		                    if (createdBy && createdBy.value && !createdBy.value.trim()) {
		                        createdBy.value = users[0]?.username || '';
		                    }
		                }
		            })
		            .catch(error => {
		                console.error("Error loading users:", error);
		                usersLoading = false;
		            });
		    }

		    if (!cachedLeads && !leadsLoading) {
		        leadsLoading = true;
		        fetch("http://localhost:8085/api/leads")
		            .then(response => response.json())
		            .then(leads => {
		                cachedLeads = leads;
		                leadsLoading = false;
		                
		                // If we're in edit mode, update lead field if empty
		                if ((isEditMode || isAddMode) && document.getElementById('edit-lead')) {
		                    const leadField = document.getElementById('edit-lead');
		                    if (leadField && !leadField.value.trim() && leads.length > 0) {
		                        leadField.value = leads[0]?.contactName || '';
		                        document.getElementById('edit-leadId').value = leads[0]?.leadId || '';
		                    }
		                }
		            })
		            .catch(error => {
		                console.error("Error loading leads:", error);
		                leadsLoading = false;
		            });
		    }
		}
		  
		 
