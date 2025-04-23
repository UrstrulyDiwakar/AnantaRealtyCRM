let leadsData;


// Add these at the top of your dashboard.js
const loadingContainer = document.getElementById('loading-container');
const contentContainer = document.getElementById('content-container');

function showLoading() {
	loadingContainer.style.display = 'flex';
	contentContainer.style.display = 'none';
}

function hideLoading() {
	loadingContainer.style.display = 'none';
	contentContainer.style.display = 'block';
}

// Modify your window.onload
window.onload = async function() {
	showLoading();
	try {
		await fetchLeads();
		await fetchLeadsOfCurrentUser();
	} catch (error) {
		console.error("Error in window.onload:", error);
		// Optional: Show error message to user
		alert("Failed to load dashboard data. Please try again.");
	} finally {
		hideLoading();
	}
};

async function fetchLeads() {
	try {
		const response = await fetch("http://localhost:8085/api/leads");

		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		const data = await response.json();
		leadsData = data;

		let leadsByOwner = {};
		let leadsByStage = {};
		let leadsBySource = {};
		let closedWon = 0;
		let closedLost = 0;

		let newRecords = 0;
		let AllActiveRecords = 0;
		let interested = 0;
		let Contacted = 0;
		let followUp = 0;
		let dealClosed = 0;
		let lostCall = 0;
		let CancelLead = 0;
		let notInterested = 0;

		let estimatedRevAllActive = 0;
		let estimatedRevNewRec = 0;
		let estimatedRevInterested = 0;
		let estimatedRevContacted = 0;
		let estimatedRevDealClosed = 0;
		let estimatedRevCancelLead = 0;
		let estimatedRevFollowUp = 0;
		let estimatedRevNotInterested = 0;

		for (let i = 0; i < data.length; i++) {
			// Convert leadStage to lowercase for case-insensitive comparison
			const leadStage = data[i].leadStage.toLowerCase();

			if (leadStage === "interested") {
				interested++;
				estimatedRevInterested += data[i].expectedRevenue;
			} else if (leadStage === "new") {
				newRecords++;
				estimatedRevNewRec += data[i].expectedRevenue;
			} else if (leadStage === "contacted") {
				Contacted++;
				estimatedRevContacted += data[i].expectedRevenue;
			} else if (leadStage === "follow up") {
				followUp++;
				estimatedRevFollowUp += data[i].expectedRevenue;
			} else if (leadStage === "deal closed") {
				dealClosed++;
				estimatedRevDealClosed += data[i].expectedRevenue;
			} else if (leadStage === "cancel lead") {
				CancelLead++;
				estimatedRevCancelLead += data[i].expectedRevenue;
			} else if (leadStage === "not interested") {
				notInterested++;
				estimatedRevNotInterested += data[i].expectedRevenue;
			} else if (leadStage !== "cancel lead" && leadStage !== "deal closed") {
				AllActiveRecords++;
				estimatedRevAllActive += data[i].expectedRevenue;
			}
		}

		AllActiveRecords = interested + newRecords + Contacted + followUp + notInterested;
		estimatedRevAllActive = estimatedRevInterested + estimatedRevNewRec + estimatedRevContacted + estimatedRevFollowUp + estimatedRevNotInterested;

		// Display the records with consistent styling
		document.getElementById('AllActiveRecordsAllRec').innerHTML =
			`<span class="number">${AllActiveRecords}</span><span class="text">RECORDS</span>`;

		document.getElementById('interestedRecordsAR').innerHTML =
			`<span class="number">${interested}</span><span class="text">RECORDS</span>`;

		document.getElementById('contactedRecordsAL').innerHTML =
			`<span class="number">${Contacted}</span><span class="text">RECORDS</span>`;

		document.getElementById('FollowUpRecodsAL').innerHTML =
			`<span class="number">${followUp}</span><span class="text">RECORDS</span>`;

		document.getElementById('clossedRecordsAL').innerHTML =
			`<span class="number">${dealClosed}</span><span class="text">RECORDS</span>`;

		document.getElementById('cancelLeadRecord').innerHTML =
			`<span class="number">${CancelLead}</span><span class="text">RECORDS</span>`;

		document.getElementById('notInterestedRecordsAR').innerHTML =
			`<span class="number">${notInterested}</span><span class="text">RECORDS</span>`;

		document.getElementById('LostCallRecordsAL').innerHTML =
			`<span class="number">${lostCall}</span><span class="text">RECORDS</span>`;

		document.getElementById('estimatedpriceAllActive').textContent = (estimatedRevAllActive / 100000).toFixed(2) + " L";
		document.getElementById('estimatedpriceInterested').textContent = (estimatedRevInterested / 100000).toFixed(2) + " L";
		document.getElementById('estimatedpriceContacted').textContent = (estimatedRevContacted / 100000).toFixed(2) + " L";
		document.getElementById('estimatedpriceFollowUp').textContent = (estimatedRevFollowUp / 100000).toFixed(2) + " L";
		document.getElementById('estimatedpriceDealClosed').textContent = (estimatedRevDealClosed / 100000).toFixed(2) + " L";
		document.getElementById('estimatedpriceCancelLead').textContent = (estimatedRevCancelLead / 100000).toFixed(2) + " L";

		// Process follow-up data
		const todayObj = new Date();
		const tomorrowObj = new Date();
		tomorrowObj.setDate(todayObj.getDate() + 1);
		const next7daysObj = new Date();
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

		// For follow-up summary section
		document.getElementById('allPlannedFS').innerHTML =
			`<span class="number">${allPlannedCount}</span><span class="text">RECORDS</span>`;

		document.getElementById('missedCallsFS').innerHTML =
			`<span class="number">${missedCallsCount}</span><span class="text">RECORDS</span>`;

		document.getElementById('dueTodayFS').innerHTML =
			`<span class="number">${dueTodayCount}</span><span class="text">RECORDS</span>`;

		document.getElementById('overdueLeadsFS').innerHTML =
			`<span class="number">${overDueCount}</span><span class="text">RECORDS</span>`;

		document.getElementById('duetommarowFS').innerHTML =
			`<span class="number">${dueTomorrowCount}</span><span class="text">RECORDS</span>`;

		document.getElementById('dueNext7Dayscount').innerHTML =
			`<span class="number">${dueNext7daysCount}</span><span class="text">RECORDS</span>`;


		// Closed Lost Leads
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(todayObj.getDate() - 30);

		for (let i = 0; i < data.length; i++) {
			const lead = data[i];
			if (lead.siteVisited === "visited" && lead.leadStage === "cancel lead" && lead.nextFollowUpOn) {
				const nextFollowUpDate = new Date(lead.nextFollowUpOn);
				if (nextFollowUpDate >= thirtyDaysAgo && nextFollowUpDate <= todayObj) {
					closedLost++;

				}
			}

			if (lead.leadOwner && lead.leadOwner.trim() !== "") {
				leadsByOwner[lead.leadOwner] = (leadsByOwner[lead.leadOwner] || 0) + 1;
			}

			if (lead.leadStage) {
				leadsByStage[lead.leadStage] = (leadsByStage[lead.leadStage] || 0) + 1;
			}

			let leadSource = "Unknown";
			if (lead.sourceInfo && typeof lead.sourceInfo === "object" && lead.sourceInfo.leadSource) {
				leadSource = lead.sourceInfo.leadSource.trim();
			}

			if (leadSource !== "Unknown" && leadSource !== "") {
				leadsBySource[leadSource] = (leadsBySource[leadSource] || 0) + 1;
			}

			if (lead.leadStage === "Deal Closed" && lead.nextFollowUpOn) {
				const nextFollowUpDate = new Date(lead.nextFollowUpOn);
				if (nextFollowUpDate >= thirtyDaysAgo && nextFollowUpDate <= todayObj) {
					closedWon++;
				}

			} else if (lead.leadStage === "not interested") {
				closedLost++;
			}
		}

		const structuredData = {
			leadsByOwner: Object.entries(leadsByOwner).map(([owner, count]) => ({ owner, count })),
			leadsByStage: Object.entries(leadsByStage).map(([stage, count]) => ({ stage, count })),
			leadsBySource: Object.entries(leadsBySource).map(([source, count]) => ({ source, count })),
			closedWon: { count: closedWon },
			closedLost: { count: closedLost }
		};
		console.log(data)
		renderCharts({ ...structuredData, leads: data });
	} catch (error) {
		console.error("Error fetching leads:", error);
	} finally {
		hideLoading();
	}
}


async function fetchLeadsOfCurrentUser() {
	try {
		const response = await fetch("http://localhost:8085/api/leadsUser");

		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		const data = await response.json();

		let allActiveMyRec = 0;
		let newRecords = 0;

		let estimatedRevNewLeads = 0;
		let estimatedRevAllMyRec = 0;



		for (let i = 0; i < data.length; i++) {
			const lead = data[i];
			if (lead.leadStage == "Interested") {
				allActiveMyRec++;
				estimatedRevAllMyRec += lead.expectedRevenue;
			} else if (lead.leadStage == "New") {
				newRecords++;
				estimatedRevNewLeads += data[i].expectedRevenue;
				allActiveMyRec++;
				estimatedRevAllMyRec += lead.expectedRevenue;
			} else if (lead.leadStage == "Contacted") {
				allActiveMyRec++;
				estimatedRevAllMyRec += lead.expectedRevenue;
			} else if (lead.leadStage == "follow up") {
				allActiveMyRec++;
				estimatedRevAllMyRec += lead.expectedRevenue;
			} else if (lead.leadStage == "not interested") {
				allActiveMyRec++;
				estimatedRevAllMyRec += lead.expectedRevenue;
			}
		}


		document.getElementById('allActiveMyRec').innerHTML =
			`<span class="number">${allActiveMyRec}</span><span class="text">RECORDS</span>`;

		document.getElementById('newRecodsMyRec').innerHTML =
			`<span class="number">${newRecords}</span><span class="text">RECORDS</span>`;

		document.getElementById('estimatedpriceAllActiveMy').textContent = (estimatedRevAllMyRec / 100000).toFixed(2) + " L";
		document.getElementById('estimatedpriceAllActiveMyNew').textContent = (estimatedRevNewLeads / 100000).toFixed(2) + " L";



	} catch (error) {
		console.error("Error fetching leads:", error);
	}
}

window.onload = async function() {
	await fetchLeads();
	await fetchLeadsOfCurrentUser();
};

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
	if (closedLostElement) closedLostElement.innerText = data.closedLost || "No data found";

	createSalesForecastByStageChart("salesForecastByStageChart", data.leads);
	createClosedLostByOwnerChart("closedLostByOwnerChart", data.leads);
}

// Chart Creation Functions (same as your previous implementation)


// Chart Creation Functions
function createBarChart(chartId, labels, values, label) {
	const ctx = document.getElementById(chartId)?.getContext("2d");
	if (!ctx) return;

	// Step 1: Dynamically adjust chart height based on the number of labels
	const minHeight = 250; // Minimum height for the chart
	const maxHeight = 500; // Maximum height for the chart
	const heightPerBar = 30; // Height per bar in pixels
	const chartHeight = Math.min(maxHeight, Math.max(minHeight, labels.length * heightPerBar));

	// Set the canvas height dynamically
	const canvas = document.getElementById(chartId);
	if (canvas) {
		canvas.style.height = `${chartHeight}px`;
	}

	// Step 2: Adjust bar thickness and spacing based on the number of labels
	const minBarThickness = 20; // Minimum bar thickness to ensure hover works
	const barThickness = Math.max(minBarThickness, 30 - (labels.length * 0.5)); // Adjust bar thickness dynamically

	new Chart(ctx, {
		type: "bar",
		data: {
			labels,
			datasets: [{
				label,
				data: values,
				backgroundColor: "rgba(75, 192, 192, 0.5)",
				borderColor: "rgba(75, 192, 192, 1)",
				borderWidth: 1,
				hoverBackgroundColor: "rgba(255, 99, 132, 0.8)",
				hoverBorderColor: "rgba(255, 99, 132, 1)",
				hoverBorderWidth: 2,
				barThickness: barThickness,
				categoryPercentage: 0.8, // Adjust the space between bars
				barPercentage: 0.9
			}]
		},
		options: {
			responsive: true,
			maintainAspectRatio: false, // Allow the chart to adjust its aspect ratio
			scales: {
				x: {
					grid: {
						drawBorder: false,
						drawTicks: false,
						display: false
					},
					ticks: {
						autoSkip: false, // Ensure all labels are displayed
						maxRotation: 45, // Rotate labels if they are too long
						minRotation: 0,
						font: {
							size: 12 // Adjust font size for better readability
						}
					}
				},
				y: {
					beginAtZero: true,
					grid: {
						drawBorder: false,
						drawTicks: false,
						display: true
					},
					ticks: {
						font: {
							size: 12 // Adjust font size for better readability
						}
					}
				}
			},
			plugins: {
				tooltip: {
					enabled: true,
					backgroundColor: "rgba(0,0,0,0.7)",
					intersect: true, // Only show tooltip when hovering directly over a bar
					mode: "index" // Ensure tooltip is triggered for the exact bar being hovered
				}
			},
			hover: {
				mode: "index", // Hover mode set to index for precise hover behavior
				intersect: true, // Only trigger hover when directly over a bar
				animationDuration: 300
			},
			layout: {
				padding: {
					left: 10,
					right: 10,
					top: 10,
					bottom: 10
				}
			},
			// Ensure bars are always large enough to interact with
			interaction: {
				mode: "index",
				intersect: true
			}
		}
	});
}
function createHorizontalBarChart(chartId, labels, values, label) {
	const ctx = document.getElementById(chartId)?.getContext("2d");
	if (!ctx) return;

	const barThickness = Math.max(10, 16 - (labels.length * 0.2)); // Adjust bar thickness based on the number of labels

	new Chart(ctx, {
		type: "bar",
		data: {
			labels,
			datasets: [{
				label,
				data: values,
				backgroundColor: "rgba(255, 99, 132, 0.5)",
				borderColor: "rgba(255, 99, 132, 1)",
				borderWidth: 1,
				hoverBackgroundColor: "rgba(54, 162, 235, 0.8)",
				hoverBorderColor: "rgba(54, 162, 235, 1)",
				hoverBorderWidth: 1,
				barThickness: barThickness,
				categoryPercentage: 0.8, // Adjust the space between bars
				barPercentage: 0.9
			}]
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			indexAxis: "y",
			scales: {
				y: {
					grid: {
						drawBorder: false,
						drawTicks: false,
						display: false
					},
					ticks: {
						autoSkip: true,
						maxRotation: 0,
						minRotation: 0
					}
				},
				x: {
					beginAtZero: true,
					grid: {
						drawBorder: false,
						drawTicks: false,
						display: true
					}
				}
			},
			plugins: {
				tooltip: {
					enabled: true,
					backgroundColor: "rgba(0,0,0,0.7)",
					intersect: true, // Only show tooltip when hovering directly over a bar
					mode: "index" // Ensure tooltip is triggered for the exact bar being hovered
				}
			},
			hover: {
				mode: "index", // Hover mode set to index for precise hover behavior
				intersect: true, // Only trigger hover when directly over a bar
				animationDuration: 300
			},
			layout: {
				padding: {
					left: 10,
					right: 10,
					top: 10,
					bottom: 10
				}
			}
		}
	});
}
function createFunnelChart(chartId, data) {
	const ctx = document.getElementById(chartId)?.getContext("2d");
	if (!ctx) return;

	// Step 1: Normalize the data (convert all leadStage values to lowercase)
	const normalizedData = data.map(item => ({
		stage: item.stage.toLowerCase(), // Convert stage to lowercase
		count: item.count
	}));

	// Step 2: Group stages and sum their counts
	const groupedData = normalizedData.reduce((acc, item) => {
		if (acc[item.stage]) {
			acc[item.stage] += item.count; // If stage already exists, add to its count
		} else {
			acc[item.stage] = item.count; // Otherwise, create a new entry
		}
		return acc;
	}, {});

	// Step 3: Convert the grouped data back into an array of { stage, count } objects
	const processedData = Object.entries(groupedData).map(([stage, count]) => ({
		stage,
		count
	}));

	// Step 4: Generate unique colors for each stage
	const colors = generateUniqueColors(processedData.length);

	// Step 5: Create the chart
	new Chart(ctx, {
		type: "doughnut",
		data: {
			labels: processedData.map(item => item.stage),
			datasets: [{
				data: processedData.map(item => item.count),
				backgroundColor: colors, // Use dynamically generated colors
				hoverBackgroundColor: colors.map(color => shadeColor(color, -20)), // Darken colors on hover
				hoverBorderColor: "rgba(255, 255, 255, 1)", // White border on hover
				hoverBorderWidth: 2 // Border width on hover
			}]
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				tooltip: {
					enabled: true,
					backgroundColor: "rgba(0,0,0,0.7)"
				}
			},
			hover: {
				mode: "nearest",
				animationDuration: 300
			}
		}
	});
}

// Function to generate unique colors
function generateUniqueColors(count) {
	const colors = [];
	const hueStep = 360 / count; // Distribute hues evenly

	for (let i = 0; i < count; i++) {
		const hue = i * hueStep; // Calculate hue
		const color = `hsl(${hue}, 70%, 50%)`; // Generate HSL color
		colors.push(color);
	}

	return colors;
}

// Function to darken a color (for hover effects)
function shadeColor(color, percent) {
	let R = parseInt(color.substring(1, 3), 16);
	let G = parseInt(color.substring(3, 5), 16);
	let B = parseInt(color.substring(5, 7), 16);

	R = parseInt(R * (100 + percent) / 100);
	G = parseInt(G * (100 + percent) / 100);
	B = parseInt(B * (100 + percent) / 100);

	R = R < 255 ? R : 255;
	G = G < 255 ? G : 255;
	B = B < 255 ? B : 255;

	const RR = R.toString(16).length == 1 ? "0" + R.toString(16) : R.toString(16);
	const GG = G.toString(16).length == 1 ? "0" + G.toString(16) : G.toString(16);
	const BB = B.toString(16).length == 1 ? "0" + B.toString(16) : B.toString(16);

	return `#${RR}${GG}${BB}`;
}
function createPieChart(chartId, data) {
	const ctx = document.getElementById(chartId)?.getContext("2d");
	if (!ctx) return;

	new Chart(ctx, {
		type: "pie",
		data: {
			labels: Object.keys(data),
			datasets: [{
				data: Object.values(data),
				backgroundColor: ["#6A9C89"],
				hoverBackgroundColor: ["#1F7D53"], // Colors on hover
				hoverBorderColor: "rgba(255, 255, 255, 1)",     // White border on hover
				hoverBorderWidth: 2                            // Border width on hover
			}]
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				tooltip: {
					enabled: true,
					backgroundColor: "rgba(0,0,0,0.7)"
				}
			},
			hover: {
				mode: "nearest",
				animationDuration: 300
			}
		}
	});
}

function createClosedLostByOwnerChart(chartId, leads) {
	const ctx = document.getElementById(chartId)?.getContext("2d");
	if (!ctx) return;

	// Ensure the leads array is available
	if (!Array.isArray(leads)) {
		console.error("Expected 'leads' to be an array, but got:", leads);
		return;
	}

	// Get the current date and the date 30 days ago
	const today = new Date();
	const thirtyDaysAgo = new Date(today);
	thirtyDaysAgo.setDate(today.getDate() - 30);

	// Filter the leads based on conditions:
	// 1. siteVisited should be 'visited'
	// 2. leadStage should be 'cancel lead'
	// 3. Date should be within the last 30 days
	const filteredLeads = leads.filter(lead => {
		const leadDate = new Date(lead.nextFollowUpOn); // Assuming 'sourceInfo.leadDate' exists

		return (
			lead.siteVisited === "visited" && // Check if siteVisited is 'visited'
			lead.leadStage === "cancel lead" && // Check if leadStage is 'cancel lead'
			leadDate >= thirtyDaysAgo && leadDate <= today // Check if leadDate is within the last 30 days
		);
	});

	// Calculate the total count of "closed lost" leads
	const totalClosedLostLeads = filteredLeads.length;

	// If no closed lost leads were found, log a message and return
	if (totalClosedLostLeads === 0) {
		console.log("No Closed Lost leads matching the criteria were found in the last 30 days.");
		return;
	}

	// Prepare the chart data
	const chartData = {
		labels: ['Closed Lost Leads'], // Single label for the total count
		datasets: [{
			label: "Total Closed Lost Leads (Last 30 Days)",
			data: [totalClosedLostLeads], // Use the total count
			backgroundColor: "#00b1b0", // Color for the segment

			hoverBackgroundColor: ["#ff8370"], // Colors on hover
			hoverBorderColor: "rgba(255, 255, 255, 1)",     // White border on hover
			hoverBorderWidth: 2
		}]
	};

	// Create the pie chart (single segment for the count)
	new Chart(ctx, {
		type: 'pie', // Use pie chart
		data: chartData,
		options: {
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				tooltip: {
					enabled: true,
					backgroundColor: "#fb6b90"
				}
			},
			hover: {
				mode: "nearest",
				animationDuration: 300
			}
		}
	});
}






function createSalesForecastByStageChart(chartId, data) {
	const ctx = document.getElementById(chartId)?.getContext("2d");
	if (!ctx) return;

	// Step 1: Check if 'data' is an array and not empty
	if (!Array.isArray(data)) {
		console.error("Expected 'data' to be an array, but got:", data);
		return; // Exit if data is not an array
	}

	// Step 2: Calculate total expected revenue for each stage
	const revenueByStage = {};

	data.forEach(lead => {
		const stage = lead.leadStage;
		const revenue = lead.expectedRevenue || 0; // Ensure revenue is not undefined

		// If the stage already exists in revenueByStage, add the revenue to it
		if (revenueByStage[stage]) {
			revenueByStage[stage] += revenue;
		} else {
			// Otherwise, create a new entry for that stage
			revenueByStage[stage] = revenue;
		}
	});

	// Step 3: Prepare chart data
	const stages = Object.keys(revenueByStage); // Get all the stages
	const expectedRevenue = Object.values(revenueByStage); // Get the total expected revenue for each stage

	// Step 4: Dynamically adjust chart height based on the number of data points
	const minHeight = 250; // Minimum height for the chart
	const maxHeight = 500; // Maximum height for the chart
	const heightPerBar = 30; // Height per bar in pixels
	const chartHeight = Math.min(maxHeight, Math.max(minHeight, stages.length * heightPerBar));

	// Set the canvas height dynamically
	const canvas = document.getElementById(chartId);
	if (canvas) {
		canvas.style.height = `${chartHeight}px`;
	}

	// Step 5: Prepare the chart data
	const chartData = {
		labels: stages, // Use lead stages as labels
		datasets: [{
			label: "Expected Revenue by Stage",
			data: expectedRevenue,
			type: 'bar', // Use bar chart for expected revenue
			backgroundColor: "#7A73D1", // Color for the bars
			borderColor: "#57B4BA",
			borderWidth: 0.5,
			hoverBackgroundColor: "#FFB433", // Color on hover
			hoverBorderColor: "rgba(54, 162, 235, 1)", // Border color on hover
			hoverBorderWidth: 0.5, // Border width on hover
			barThickness: 'flex', // Let Chart.js automatically adjust bar thickness
			categoryPercentage: 0.8, // Adjust the space between bars
			barPercentage: 0.9
		}]
	};

	// Step 6: Create the chart
	new Chart(ctx, {
		type: 'bar', // Bar chart type
		data: chartData,
		options: {
			responsive: true,
			maintainAspectRatio: false, // Allow the chart to adjust its aspect ratio
			plugins: {
				tooltip: {
					// Customizing tooltips
					enabled: true,
					callbacks: {
						// Modify the tooltip title to show the stage name
						title: function(tooltipItem) {
							return tooltipItem[0].label; // Display the stage name
						},
						// Modify the tooltip label to show expected revenue in rupees
						label: function(tooltipItem) {
							const revenue = tooltipItem.raw; // Get the raw data value (expected revenue)
							return 'Expected Revenue: ₹' + revenue.toLocaleString(); // Format the number with a rupee sign
						}
					}
				}
			},
			scales: {
				x: {
					beginAtZero: true,
					grid: {
						drawBorder: false,
						drawTicks: false,
						display: false
					},
					ticks: {
						autoSkip: false, // Ensure all labels are displayed
						maxRotation: 45, // Rotate labels if they are too long
						minRotation: 0
					}
				},
				y: {
					beginAtZero: true,
					grid: {
						drawBorder: false,
						drawTicks: false,
						display: true
					},
					ticks: {
						callback: function(value) {
							// Format y-axis values with rupee sign
							return '₹' + value.toLocaleString();
						}
					}
				}
			},
			layout: {
				padding: {
					left: 10,
					right: 10,
					top: 10,
					bottom: 10
				}
			}
		}
	});
}





