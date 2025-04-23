function loadPage(page) {
	console.log("Loading page:", page);
	let iframe = document.getElementById("contentFrame");

	if (iframe) {
		iframe.src = page;
		localStorage.setItem('currentPage', page);
	} else {
		console.error("Iframe not found!");
	}
}

// Ensure Dashboard is loaded by default on page load
document.addEventListener("DOMContentLoaded", function() {
	console.log("DOM fully loaded");

	const savedPage = localStorage.getItem('currentPage');
	console.log("Saved page from localStorage:", savedPage);

	if (savedPage) {
		console.log("Loading saved page:", savedPage);
		loadPage(savedPage);
	} else {
		console.log("No saved page found. Loading dashboard.html by default.");
		loadPage('dashboard.html');
	}
});



// Expand sidebar on hover
function expandSidebar() {
	let sidebar = document.getElementById("sidebar");
	if (sidebar) {
		sidebar.classList.remove("collapsed");
	} else {
		console.error("Sidebar element not found!");
	}
}

// Ensure clicking "Leads" loads leads.html
document.querySelector('.menu-item[onclick="loadPage(\'leads.html\')"]').addEventListener('click', function() {
	loadPage('leads.html');
});
