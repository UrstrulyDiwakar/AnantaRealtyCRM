document.addEventListener("DOMContentLoaded", function() {
	const newTaskBtn = document.querySelector(".new-task-btn");
	const taskFormContainer = document.getElementById("taskFormContainer");
	const editTaskFormContainer = document.getElementById("editTaskFormContainer");
	const saveTaskBtn = document.getElementById("saveTask");
	const updateTaskBtn = document.getElementById("updateTask");
	const cancelEditBtn = document.getElementById("cancelEdit");
	const cancelNewTaskBtn = document.getElementById("cancelNewTask");
	const openRelatedPopupBtn = document.getElementById("openRelatedPopup");
	const editRelatedPopupBtn = document.getElementById("editRelatedPopup");
	const relatedPopup = document.getElementById("relatedPopup");
	const completionPopup = document.getElementById("completionPopup");
	const closeCompletionBtn = document.querySelector(".completion-close-popup");
	const followOnTaskForm = document.getElementById("followOnTaskForm");
	const editUserPopup = document.getElementById("editUserPopup");
	const editAssignedToField = document.getElementById("editAssignedTo");
	const followAssignedTo = document.getElementById("followAssignedTo");
	const searchBar = document.getElementById("searchBar");
	const searchButton = document.getElementById("searchButton");
	const clearButton = document.querySelector(".clear-btn");
	const refreshButton = document.querySelector(".refresh-btn");


	const lastUserPopUp = document.getElementById("lastUserPopUp");

	let editingTaskId = null;
	let allTasks = [];

	// ✅ Click event for Refresh Button (Now Respects Filters)
	if (refreshButton) {
		refreshButton.addEventListener("click", function() {
			searchBar.value = ""; // ✅ Clear search bar
			fetchTasks(true); // ✅ Pass `true` to apply filters after fetching
		});
	}

	const sidebar = document.querySelector(".sidebar");
	const mainContent = document.querySelector(".main-content");
	const toggleButton = document.querySelector(".sidebar-toggle");

	toggleButton.addEventListener("click", function() {
		if (sidebar.classList.contains("collapsed")) {
			// Expand Sidebar
			sidebar.classList.remove("collapsed");
			mainContent.style.marginLeft = "300px";
			mainContent.style.width = "calc(100% - 300px)";
			toggleButton.innerHTML = "❮❮"; // Left arrow when expanded
		} else {
			// Collapse Sidebar
			sidebar.classList.add("collapsed");
			mainContent.style.marginLeft = "50px";
			mainContent.style.width = "calc(100% - 80px)";
			toggleButton.innerHTML = "❯"; // Right arrow when collapsed
		}
	});

	// ✅ Click event for Clear Button
	if (clearButton && searchBar) {
		clearButton.addEventListener("click", function() {
			searchBar.value = ""; // ✅ Clear the search input
			applyFilters(); // ✅ Show all tasks based on filters
		});
	}

	if (searchButton && searchBar) {
		searchButton.addEventListener("click", function() {
			const searchTerm = searchBar.value.trim();
			if (searchTerm === "") {
				applyFilters(); // ✅ Show tasks based on filters if search is empty
			} else {
				applySearchFilter(searchTerm);
			}
		});
	} else {
		console.error("❌ searchBar or searchButton element not found!");
	}

	if (editUserPopup) {
		editUserPopup.addEventListener("click", function() {
			openUserPopup(); // ✅ Call openUserPopup function
		});
	} else {
		console.error("❌ editUserPopup element not found!");
	}

	if (lastUserPopUp) {
		lastUserPopUp.addEventListener("click", function() {
			openUserPopup(); // ✅ Call openUserPopup function
		});
	} else {
		console.error("❌ lastUserPopUp element not found!");
	}


	// ✅ Open New Task Form
	newTaskBtn.addEventListener("click", function() {
		resetNewTaskForm();
		taskFormContainer.style.display = "block";
		editTaskFormContainer.style.display = "none";

		// ✅ Ensure "relatedTo" field is re-enabled and clickable
		document.getElementById("relatedTo").removeAttribute("disabled");
	});

	// ✅ Reset New Task Form
	function resetNewTaskForm() {
		document.getElementById("taskName").value = "";
		document.getElementById("assignedTo").value = "";
		document.getElementById("dueDate").value = "";
		document.getElementById("dueTime").value = "";
		document.getElementById("relatedTo").value = "";
		document.getElementById("relatedTo").setAttribute("placeholder", "Select Related Lead");
	}

	// ✅ Close Forms
	cancelNewTaskBtn.addEventListener("click", () => taskFormContainer.style.display = "none");
	cancelEditBtn.addEventListener("click", () => editTaskFormContainer.style.display = "none");

	// ✅ Open Related Popup (Fetch Leads)
	function openRelatedPopup() {
		fetch("http://localhost:8085/api/leads")
			.then(response => response.json())
			.then(leads => {
				const relatedList = document.getElementById("relatedList");
				relatedList.innerHTML = "";
				leads.forEach(lead => {
					let row = document.createElement("tr");
					row.innerHTML = `
                        <td>${lead.leadOwner}</td>
                        <td>${lead.leadDate}</td>
                        <td>${lead.contactName}</td>
                        <td>${lead.mobile_number}</td>
                        <td>${lead.leadStage}</td>
                        <td>${lead.expectedRevenue}</td>
                        <td>${lead.nextFollowUpOn}</td>
                        <td>${lead.nextFollowUpNotes}</td>
                    `;
					row.addEventListener("click", function() {
						const selectedLead = lead.leadId;

						if (document.getElementById("taskFormContainer").style.display === "block") {
							document.getElementById("relatedTo").value = selectedLead;
							document.getElementById("relatedTo").dispatchEvent(new Event("input"));
						} else if (editingTaskId) {
							document.getElementById("editRelatedTo").value = selectedLead;
							document.getElementById("editRelatedTo").dispatchEvent(new Event("input"));
						}

						relatedPopup.style.display = "none";
					});

					relatedList.appendChild(row);
				});
				relatedPopup.style.display = "flex";
			})
			.catch(error => console.error("Error fetching leads:", error));
	}

	openRelatedPopupBtn.addEventListener("click", openRelatedPopup);
	editRelatedPopupBtn.addEventListener("click", openRelatedPopup);
	document.querySelector(".close-popup").addEventListener("click", () => relatedPopup.style.display = "none");

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
						const selectedUser = user.username;

						if (document.getElementById("followOnTaskForm").style.display === "block") {
							document.getElementById("followAssignedTo").value = selectedUser;
							document.getElementById("followAssignedTo").dispatchEvent(new Event("input"));
						} else if (document.getElementById("taskFormContainer").style.display === "block") {
							document.getElementById("assignedTo").value = selectedUser;
							document.getElementById("assignedTo").dispatchEvent(new Event("input"));
						} else if (editingTaskId) {
							document.getElementById("editAssignedTo").value = selectedUser;
							document.getElementById("editAssignedTo").dispatchEvent(new Event("input"));
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

	// ✅ Flatpickr Initialization
	flatpickr("#dueDate, #editDueDate", { dateFormat: "Y-m-d" });

	flatpickr("#followDueTime", {
		enableTime: true,
		noCalendar: true,
		dateFormat: "H:i",  // ✅ 24-hour format (HH:MM)
		time_24hr: true      // ✅ Forces 24-hour format, removes AM/PM
	});


	// ✅ Fetch Tasks from API
	function fetchTasks(applyFiltersAfter = false) {
		fetch("http://localhost:8085/api/tasks")
			.then(response => response.json())
			.then(tasks => {
				allTasks = tasks;
				console.log("Tasks refreshed:", tasks);

				if (applyFiltersAfter) {
					applyFilters(); // ✅ Reapply filters after fetching new tasks
				} else {
					renderTasks(tasks);
				}
			})
			.catch(error => console.error("Error fetching tasks:", error));
	}


	document.getElementById("applyFilter").addEventListener("click", function() {
		applyFilters(); // ✅ Apply both Status and User filters
	});

	document.getElementById("searchBar").addEventListener("input", function() {
		applySearchFilter();
	});


	function applySearchFilter(searchTerm) {
		if (!searchTerm) {
			applyFilters(); // ✅ If empty, fallback to applied filters
			return;
		}

		const filteredTasks = allTasks.filter(task =>
			task.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			task.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
			task.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(task.lead && task.lead.contactName.toLowerCase().includes(searchTerm.toLowerCase()))
		);

		renderTasks(filteredTasks);
	}


	function applyFilters() {
		const showOpen = document.getElementById("statusOpen").checked;
		const showOverdue = document.getElementById("statusOverdue").checked;
		const showClosed = document.getElementById("statusClosed").checked;

		// ✅ Get selected users
		const selectedCheckboxes = document.querySelectorAll(".user-checkbox:checked");
		const selectedUsers = Array.from(selectedCheckboxes).map(checkbox => checkbox.value.trim());

		// ✅ Get selected date range
		const dateFilter = document.getElementById("dateFilter").value;
		const startDate = document.getElementById("startDate").value;
		const endDate = document.getElementById("endDate").value;

		console.log("Selected Filters -> Status:", { showOpen, showOverdue, showClosed },
			"Users:", selectedUsers,
			"Date Filter:", dateFilter, "Start:", startDate, "End:", endDate);

		const today = moment().format("YYYY-MM-DD");
		const yesterday = moment().subtract(1, "days").format("YYYY-MM-DD");
		const sevenDaysAgo = moment().subtract(7, "days").format("YYYY-MM-DD");
		const sevenDaysLater = moment().add(7, "days").format("YYYY-MM-DD");

		const filteredTasks = allTasks.filter(task => {
			let assignedUser = task.assignedTo ? task.assignedTo.toString().trim() : "";
			let taskDueDate = task.dueDate ? moment(task.dueDate).format("YYYY-MM-DD") : null;

			console.log(`Checking Task ${task.taskId} -> Due Date: '${taskDueDate}', Assigned To: '${assignedUser}'`);

			// ✅ Match Status
			const statusMatch =
				(task.status.toLowerCase() === "open" && showOpen) ||
				(task.status.toLowerCase() === "overdue" && showOverdue) ||
				(task.status.toLowerCase() === "closed" && showClosed);

			// ✅ Match User
			const userMatch = selectedUsers.length === 0 || selectedUsers.includes(assignedUser);

			// ✅ Match Date
			let dateMatch = true;
			if (dateFilter === "today") {
				dateMatch = taskDueDate === today;
			} else if (dateFilter === "yesterday") {
				dateMatch = taskDueDate === yesterday;
			} else if (dateFilter === "last7days") {
				dateMatch = taskDueDate >= sevenDaysAgo && taskDueDate <= today;
			} else if (dateFilter === "next7days") {
				dateMatch = taskDueDate >= today && taskDueDate <= sevenDaysLater;
			} else if (dateFilter === "custom" && startDate && endDate) {
				dateMatch = taskDueDate >= startDate && taskDueDate <= endDate;
			}

			console.log(`Task ${task.taskId} -> Status Match: ${statusMatch}, User Match: ${userMatch}, Date Match: ${dateMatch}`);

			return statusMatch && userMatch && dateMatch;
		});

		console.log("Filtered Tasks After Apply:", filteredTasks);
		renderTasks(filteredTasks);
	}




	document.getElementById("dateFilter").addEventListener("change", function() {
		if (this.value === "custom") {
			document.getElementById("dateRange").style.display = "block";
		} else {
			document.getElementById("dateRange").style.display = "none";
		}
	});



	// ✅ Function to Open Edit Task Form
	function openEditTaskForm(task) {
		editingTaskId = task.taskId;
		document.getElementById("editTaskName").value = task.taskName;
		document.getElementById("editAssignedTo").value = task.assignedTo;
		document.getElementById("editRelatedTo").value = task.lead.leadId;

		// ✅ Extract Date and Time separately
		if (task.dueDate) {
			let [datePart, timePart] = task.dueDate.split("T"); // Splitting at "T"
			document.getElementById("editDueDate").value = datePart; // ✅ Store date
			document.getElementById("editDueTime").value = timePart ? timePart.slice(0, 5) : ""; // ✅ Store time as HH:MM
		} else {
			document.getElementById("editDueDate").value = "";
			document.getElementById("editDueTime").value = "";
		}


		editTaskFormContainer.style.display = "block";
	}

	// ✅ Attach Edit Button Event
	document.addEventListener("click", function(event) {
		if (event.target.classList.contains("edit-task")) {
			event.preventDefault();
			const taskId = event.target.getAttribute("data-task-id");
			fetch(`http://localhost:8085/api/tasks/${taskId}`)
				.then(response => response.json())
				.then(openEditTaskForm)
				.catch(error => console.error("Error fetching task data:", error));
		}
	});

	document.getElementById("updateTask").addEventListener("click", function() {
	    if (!editingTaskId) {
	        console.error("❌ No task ID found for editing!");
	        return;
	    }

	    // ✅ Get values from input fields
	    const taskName = document.getElementById("editTaskName").value.trim();
	    const assignedTo = document.getElementById("editAssignedTo").value.trim();
	    const dueDate = formatDateTimeForBackend();
	    const dueTime = document.getElementById("editDueTime").value.trim();
	    const leadId = document.getElementById("editRelatedTo").value.trim();
	    const status = "OVERDUE"
		

	    // ✅ Validate required fields
	    if (!taskName || !assignedTo) {
	        alert("Task Name and Assigned User are required!");
	        return;
	    }

	    // ✅ First fetch lead details
	    fetch(`http://localhost:8085/api/leads/${leadId}`)
	        .then(response => {
	            if (!response.ok) {
	                throw new Error(`Lead not found for ID: ${leadId}`);
	            }
	            return response.json();
	        })
	        .then(lead => {
	            console.log("🔹 Fetched Lead:", lead);

	            // ✅ Create updated task object with full lead details
	            const updatedTask = {
	                taskId: editingTaskId,
	                taskName: taskName,
	                assignedTo: assignedTo,
	                dueDate: dueDate,
	                lead: lead, // ✅ Set the full lead object
	                status: status || "OPEN",
	                comments: "FOLLOW-ON-TASK",
	            };

	            console.log("📤 Sending Updated Task:", updatedTask);

	            // ✅ Send PUT request to update the task
	            return fetch(`http://localhost:8085/api/tasks/${editingTaskId}`, {
	                method: "PUT",
	                headers: {
	                    "Content-Type": "application/json",
	                },
	                body: JSON.stringify(updatedTask),
	            });
	        })
	        .then(response => {
	            if (!response.ok) {
	                return response.json().then(err => {
	                    console.error("❌ Backend Response Error:", err);
	                    throw new Error("Backend Error: " + JSON.stringify(err));
	                });
	            }
	            return response.json();
	        })
	        .then(data => {
	            console.log("✅ Task Updated Successfully:", data);
	            alert("Task updated successfully!");
	            closeEditTaskForm();
	            fetchTasks(); // Refresh the task list
	        })
	        .catch(error => {
	            console.error("❌ Error Updating Task:", error);
	            alert("Failed to update task: " + error.message);
	            closeEditTaskForm();
	        });
	});

	function closeEditTaskForm() {
		const editTaskFormContainer = document.getElementById("editTaskFormContainer");
		if (editTaskFormContainer) {
			editTaskFormContainer.style.display = "none";
		} else {
			console.error("❌ Edit Task Form container not found!");
		}
	}

	// Make sure this function is globally accessible
	window.closeEditTaskForm = closeEditTaskForm;



	// ✅ Helper function to format date and time for the backend
	function formatDateTimeForBackend() {
		const dueDate = document.getElementById("editDueDate").value.trim();
		const dueTime = document.getElementById("editDueTime").value.trim() || "00:00";

		if (!dueDate) return null;

		return `${dueDate}T${dueTime}:00`; // ✅ Format: YYYY-MM-DDTHH:mm:00
	}


	document.getElementById("saveTask").addEventListener("click", function() {
		// ✅ Get values from input fields
		const taskName = document.getElementById("taskName").value.trim();
		const assignedTo = document.getElementById("assignedTo").value.trim();
		const dueDate = document.getElementById("dueDate").value.trim();
		const dueTime = document.getElementById("dueTime").value.trim();
		const leadId = document.getElementById("relatedTo").value.trim(); // relatedTo contains leadId
		console.log(leadId)

		// ✅ Validate required fields
		if (!taskName || !assignedTo) {
			alert("Task Name and Assigned User are required!");
			return;
		}

		// ✅ Format due date & time properly (if both exist)
		let dueDateTime = null;
		if (dueDate) {
			dueDateTime = dueTime ? `${dueDate}T${dueTime}:00` : `${dueDate}T00:00:00`;
		}

		// ✅ Fetch lead details first
		fetch(`http://localhost:8085/api/leads/${leadId}`)
			.then(response => {
				if (!response.ok) {
					throw new Error(`Lead not found for ID: ${leadId}`);
				}
				return response.json();
			})
			.then(lead => {
				console.log("🔹 Fetched Lead:", lead);

				// ✅ Create task object with full lead details
				const newTask = {
					taskName: taskName,
					assignedTo: assignedTo,
					dueDate: dueDateTime,
					lead: lead, // ✅ Set the full lead object
					status: "OPEN", // Default status for new tasks
					comments: "", // Empty comments field initially
					description: ""
				};

				console.log("📤 Sending New Task:", newTask);

				// ✅ Send data to backend
				return fetch("http://localhost:8085/api/tasks", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(newTask),
				});
			})
			.then(response => {
				if (!response.ok) {
					return response.json().then(err => {
						console.error("❌ Backend Response Error:", err);
						throw new Error("Backend Error: " + JSON.stringify(err));
					});
				}
				return response.json();
			})
			.then(data => {
				console.log("✅ Task Created Successfully:", data);
				alert("Task successfully created!");

				// ✅ Close the form and refresh tasks
				document.getElementById("taskFormContainer").style.display = "none";
				fetchTasks(); // Refresh the task list
			})
			.catch(error => {
				console.error("❌ Error Creating Task:", error);
				alert("Failed to create task.");
			});
	});


	// ✅ Custom Date Picker for Sidebar
	const dateFilter = document.getElementById("dateFilter");
	const dateRange = document.getElementById("dateRange");
	const startDate = document.getElementById("startDate");
	const endDate = document.getElementById("endDate");

	dateFilter.addEventListener("change", function() {
		if (this.value === "custom") {
			dateRange.style.display = "block";
		} else {
			dateRange.style.display = "none";
		}
	});

	flatpickr("#startDate", { dateFormat: "Y-m-d" });
	flatpickr("#endDate", { dateFormat: "Y-m-d" });
	flatpickr("#followDueTime", {
		enableTime: true,
		noCalendar: true,
		dateFormat: "H:i", // ✅ 24-hour format (HH:MM)
		time_24hr: true // ✅ Enforce 24-hour format
	});

	// ✅ Render Task List
	// ✅ Modify renderTasks to Disable Closed Tasks
	function renderTasks(tasks) {
		const taskList = document.getElementById("task-list");
		taskList.innerHTML = "";

		tasks.forEach(task => {
			let taskElement = document.createElement("div");
			taskElement.classList.add("task-item");
			taskElement.setAttribute("data-task-id", task.taskId);

			let isClosed = task.status.toLowerCase() === "closed"; // ✅ Check if task is closed

			taskElement.innerHTML = `
            <div class="task-wrapper">
                <input type="checkbox" class="task-checkbox" data-task-id="${task.taskId}" ${isClosed ? "disabled" : ""}>
                <div class="task-content">
                    <div class="task-title">${task.taskName}</div>
                    <div class="task-lead">Leads: <a href="#">${task.lead.contactName || "N/A"}</a></div>
					<div class="task-meta">
					    Due On: ${task.dueDate ? moment(task.dueDate).format("YYYY-MM-DD") : "N/A"} | 
					    Comments: ${task.comments ? task.comments : "None"}
					</div>
                </div>
                <div class="task-actions">
                    ${!isClosed ? `<a href="#" class="edit-task" data-task-id="${task.taskId}">Edit</a>` : ""}
                    <span class="lead-owner">${task.assignedTo || "No Owner"}</span>
                </div>
            </div>
        `;

			taskList.appendChild(taskElement);

			if (!isClosed) {
				let checkbox = taskElement.querySelector(".task-checkbox");
				checkbox.addEventListener("change", function() {
					if (this.checked) {
						openCompletionPopup(task.taskId, taskElement);
					}
				});
			}
		});
	}



	// ✅ Fetch Users and Populate Sidebar
	function fetchUsers() {
		fetch("http://localhost:8085/api/getUsers")
			.then(response => response.json())
			.then(users => {
				const userListContainer = document.querySelector(".user-list");
				userListContainer.innerHTML = ""; // ✅ Clear previous list

				users.forEach(user => {
					let userLabel = document.createElement("label");

					// ✅ Ensure correct value
					userLabel.innerHTML = `<input type="checkbox" class="user-checkbox" value="${user.username.trim()}"> ${user.username}`;
					userListContainer.appendChild(userLabel);
				});

				console.log("User Checkboxes Added:", document.querySelectorAll(".user-checkbox"));

				setupUserSelection();
			})
			.catch(error => console.error("Error fetching users:", error));
	}



	// ✅ Setup "Select All / Deselect All" Functionality
	function setupUserSelection() {
		const selectAllCheckbox = document.getElementById("selectAllUsers");
		const userCheckboxes = document.querySelectorAll(".user-checkbox");

		console.log("User Checkboxes Found in setupUserSelection:", userCheckboxes);

		if (userCheckboxes.length === 0) {
			console.warn("❌ No user checkboxes found. setupUserSelection() is running too early!");
			return;
		}

		selectAllCheckbox.addEventListener("change", function() {
			userCheckboxes.forEach(checkbox => checkbox.checked = this.checked);
			selectAllCheckbox.nextSibling.textContent = this.checked ? "Deselect All" : "Select All";
		});

		userCheckboxes.forEach(checkbox => {
			checkbox.addEventListener("change", function() {
				let allChecked = [...userCheckboxes].every(cb => cb.checked);
				selectAllCheckbox.checked = allChecked;
				selectAllCheckbox.nextSibling.textContent = allChecked ? "Deselect All" : "Select All";
			});
		});
	}
	// ✅ Call fetchUsers() when the page loads
	fetchUsers();


	// ✅ Open Completion Popup
	function openCompletionPopup(taskId, taskElement) {
		const popup = document.getElementById("completionPopup");
		const rect = taskElement.getBoundingClientRect();


		if (sidebar.classList.contains("collapsed")) {
			popup.style.top = `250px`;
			popup.style.left = `500px`;
			popup.style.display = "flex";

		} else {
			popup.style.top = `250px`;
			popup.style.left = `700px`;
			popup.style.display = "flex";

		}



		document.querySelector(".completion-complete-btn").setAttribute("data-task-id", taskId);
		document.querySelector(".completion-followup-btn").setAttribute("data-task-id", taskId);
	}

	// ✅ Function to mark task as CLOSED with remarks
	function completeTask() {
		const taskId = document.querySelector(".completion-complete-btn").getAttribute("data-task-id");

		if (!taskId) {
			console.error("❌ Task ID is missing!");
			return;
		}

		// ✅ Get remarks from the textarea field
		const remarksField = document.getElementById("remarks");
		const remarks = remarksField ? remarksField.value.trim() : "";

		// Fetch the existing task to preserve other fields
		fetch(`http://localhost:8085/api/tasks/${taskId}`)
			.then(response => {
				if (!response.ok) throw new Error("Failed to fetch task details.");
				return response.json();
			})
			.then(existingTask => {
				console.log("🔹 Existing Task Data:", existingTask);

				const updatedTask = {
					...existingTask, // ✅ Keep other fields unchanged
					status: "CLOSED", // ✅ Update status to CLOSED
					comments: remarks || existingTask.comments // ✅ Update comments if provided
				};

				// ✅ Send updated task to backend
				return fetch(`http://localhost:8085/api/tasks/${taskId}`, {
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(updatedTask),
				});
			})
			.then(response => {
				if (!response.ok) {
					return response.json().then(err => {
						console.error("❌ Backend Response Error:", err);
						throw new Error("Backend Error: " + JSON.stringify(err));
					});
				}
				return response.json();
			})
			.then(data => {
				console.log("✅ Task Marked as CLOSED with Remarks:", data);
				alert("Task successfully marked as CLOSED!");
				closeCompletionPopup();
				fetchTasks(); // ✅ Refresh task list
			})
			.catch(error => {
				console.error("❌ Error Closing Task:", error);
				alert("Failed to close the task.");
			});
	}

	// ✅ Attach event listener when DOM is fully loaded
	// ✅ Attach event listener when DOM is fully loaded
	document.addEventListener("click", function(event) {
		if (event.target.classList.contains("completion-complete-btn")) {
			console.log("✅ Complete button clicked!");
			completeTask();
		}
	});

	function closeCompletionPopup() {
		completionPopup.style.display = "none";

		// ✅ Uncheck the checkbox
		let checkedCheckbox = document.querySelector(".task-checkbox:checked");
		if (checkedCheckbox) {
			checkedCheckbox.checked = false;
		}
	}
	closeCompletionBtn.addEventListener("click", closeCompletionPopup);

	function openFollowOnTaskForm(taskElement) {
		closeCompletionPopup();

		if (!taskElement) {
			console.error("❌ Task item not found!");
			return;
		}

		followOnTaskForm.style.display = "block";
		const rect = taskElement.getBoundingClientRect();

		if (sidebar.classList.contains("collapsed")) {
			followOnTaskForm.style.top = `150px`;
			followOnTaskForm.style.left = `500px`;

		} else {
			followOnTaskForm.style.top = `200px`;
			followOnTaskForm.style.left = `700px`;
		}


		// ✅ Store Task ID inside the form
		const taskId = taskElement.getAttribute("data-task-id");
		document.getElementById("followOnTaskForm").setAttribute("data-task-id", taskId);

		// ✅ Extract assigned user correctly
		const assignedUserElement = taskElement.querySelector(".lead-owner");
		const taskNameElement = taskElement.querySelector(".task-title");
		const taskMetaElement = taskElement.querySelector(".task-meta");
		console.log(assignedUserElement.innerText.trim())

		setTimeout(() => {
			document.getElementById("followAssignedTo").value = assignedUserElement ? assignedUserElement.innerText.trim() : "N/A";
			document.getElementById("followTaskName").value = taskNameElement ? taskNameElement.innerText.trim() : "";

			const dueDateField = document.getElementById("followDueDate");
			const dueTimeField = document.getElementById("followDueTime");

			let dueDateText = "";
			let dueTimeText = "00:00"; // Default to midnight (HH:mm)

			if (taskMetaElement.innerText.includes("Due On: ")) {
				let dueDateTimeRaw = taskMetaElement.innerText.split("Due On: ")[1]?.split(" |")[0];

				if (dueDateTimeRaw.includes("T")) {
					let [datePart, timePart] = dueDateTimeRaw.split("T");
					dueDateText = datePart.trim();

					if (timePart) {
						let [hour, minute] = timePart.trim().split(":").slice(0, 2); // Extract HH:mm only
						hour = hour.padStart(2, "0"); // Ensure 2-digit hour
						minute = minute.padStart(2, "0"); // Ensure 2-digit minute
						dueTimeText = `${hour}:${minute}`;
					}
				} else {
					dueDateText = dueDateTimeRaw.trim();
				}
			}

			dueDateField.value = dueDateText;
			dueTimeField.value = dueTimeText; // Ensure format HH:mm in 24-hour

			// ✅ Reinitialize Flatpickr to apply changes
			flatpickr("#followDueTime", {
				enableTime: true,
				noCalendar: true,
				dateFormat: "H:i",  // ✅ 24-hour format
				time_24hr: true      // ✅ Removes AM/PM
			});
			flatpickr("#followDueDate", { dateFormat: "Y-m-d" }); // Enforces YYYY-MM-DD format


		}, 300);
	}





	function saveFollowOnTask() {
		const assignedTo = document.getElementById("followAssignedTo").value.trim();
		console.log(assignedTo)
		const taskName = document.getElementById("followTaskName").value.trim();
		const dueDate = document.getElementById("followDueDate").value.trim();
		const dueTime = document.getElementById("followDueTime").value.trim();
		const taskId = document.getElementById("followOnTaskForm").getAttribute("data-task-id");

		if (!taskId) {
			console.error("❌ Task ID is missing for the follow-on task!");
			return;
		}

		if (!taskName || !assignedTo) {
			alert("Task Name and Assigned User are required!");
			return;
		}

		// ✅ Ensure correct time format
		let dueDateTime = null;
		if (dueDate) {
			if (dueTime && dueTime !== "N/A") {
				// ✅ Convert dueTime to correct format
				let parsedTime = moment(dueTime, ["HH:mm"]).format("HH:mm:ss");
				dueDateTime = `${moment(dueDate, "YYYY-MM-DD").format("YYYY-MM-DD")}T${parsedTime}`;
			} else {
				dueDateTime = `${moment(dueDate, "YYYY-MM-DD").format("YYYY-MM-DD")}T00:00:00`; // Default midnight
			}
		}


		// ✅ Fetch Existing Task to Preserve Lead ID
		fetch(`http://localhost:8085/api/tasks/${taskId}`)
			.then(response => response.json())
			.then(existingTask => {
				console.log("Fetched Existing Task:", existingTask);

				const followOnTask = {
					taskId: existingTask.taskId,
					taskName: taskName,
					description: existingTask.description, // ✅ Keep original description
					status: "OVERDUE",
					dueDate: dueDateTime,
					assignedTo: assignedTo,
					lead: existingTask.lead ? { leadId: existingTask.lead.leadId } : null, // ✅ Preserve Lead ID
					comments: "Follow-up task"
				};

				console.log("Updating Follow-On Task:", followOnTask);

				// ✅ Send PUT Request to Backend
				return fetch(`http://localhost:8085/api/tasks/${taskId}	`, {
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(followOnTask),
				});
			})
			.then(response => {
				if (!response.ok) {
					return response.json().then(err => {
						console.error("❌ Backend Response Error:", err);
						throw new Error("Backend Error: " + JSON.stringify(err));
					});
				}
				return response.json();
			})
			.then(data => {
				console.log("Task Updated Successfully:", data);
				alert("Follow-On Task Updated Successfully!");
				closeFollowOnTaskForm();
				fetchTasks();
			})
			.catch(error => {
				console.error("❌ Error Updating Task:", error);
				alert("Failed to update Follow-On Task.");
			});
	}



	// ✅ Attach function to window (Fixes the "not defined" error)
	window.saveFollowOnTask = saveFollowOnTask;


	// ✅ Attach Event Listener for "Create Follow-Up"
	document.addEventListener("click", function(event) {
		if (event.target.classList.contains("completion-followup-btn")) {
			const taskId = event.target.getAttribute("data-task-id");
			const taskElement = document.querySelector(`.task-item[data-task-id="${taskId}"]`);

			if (taskElement) {
				openFollowOnTaskForm(taskElement);
			} else {
				console.error("Task item not found!");
			}
		}
	});
	// ✅ Function to Close the Follow-On Task Form
	function closeFollowOnTaskForm() {
		followOnTaskForm.style.display = "none";
	}
	// ✅ Attach function to `window` to make it accessible in HTML
	window.closeFollowOnTaskForm = closeFollowOnTaskForm;

	function closeRelatedPopup() {
		const relatedPopup = document.getElementById("relatedPopup");
		if (relatedPopup) {
			relatedPopup.style.display = "none";
		} else {
			console.error("❌ relatedPopup element not found!");
		}
	}

	// Make sure this function is accessible globally
	window.closeRelatedPopup = closeRelatedPopup;


	// ✅ Attach Flatpickr to Follow-On Task Form
	flatpickr("#followDueDate", { dateFormat: "d-M-Y" });
	flatpickr("#followDueTime", { enableTime: true, noCalendar: true, dateFormat: "h:i K" });

	fetchTasks();


});
