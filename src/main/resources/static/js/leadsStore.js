export const leadsData = {
	allLeads: [],
	filteredLeads: [],
	currentPage: 1,
	recordsPerPage: 50,
	searchfilteredLeads: [],  // Default to match your select,
	// Computed property for total pages
	get totalPages() {
		// First check if searchfilteredLeads exists and is an array
		const hasSearchResults = Array.isArray(this.searchfilteredLeads) &&
			this.searchfilteredLeads.length > 0;

		const activeData = hasSearchResults ? this.searchfilteredLeads : this.filteredLeads;

		// Handle case when recordsPerPage is "all"
		if (this.recordsPerPage === "all") {
			return 1;
		}

		return Math.max(1, Math.ceil(activeData.length / this.recordsPerPage));
	},
	// Computed property for visible page numbers
	get visiblePages() {
		if (!Array.isArray(this.filteredLeads) || !Array.isArray(this.searchfilteredLeads)) {
			return [1];
		}
		const pages = [];
		const total = this.totalPages;
		const current = this.currentPage;

		// Always show first page
		if (current > 2) pages.push(1);
		if (current > 3) pages.push('...');

		// Show surrounding pages
		for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
			pages.push(i);
		}

		// Always show last page
		if (current < total - 2) pages.push('...');
		if (current < total - 1 || (current === 1 && total > 1)) pages.push(total);

		return pages.length ? pages : [1];
	}
};

export function updateLeadsData(newData) {
	if (!Array.isArray(newData)) {
		console.error('updateLeadsData expects an array');
		return;
	}
	leadsData.allLeads = newData;
	leadsData.filteredLeads = [...newData];
	leadsData.searchfilteredLeads = [];
	resetToFirstPage();
}

// Modify your setCurrentPage function:
export function setCurrentPage(page) {
	const pageNumber = parseInt(page);
	leadsData.currentPage = isNaN(pageNumber) ? 1 : Math.max(1, pageNumber);
	localStorage.setItem('leadsState', JSON.stringify(leadsData));
}

export function setRecordsPerPage(value) {
	// Handle "all" as a string, otherwise ensure it's a number
	leadsData.recordsPerPage = value === "all" ? "all" : (parseInt(value) || 50);
	localStorage.setItem('leadsState', JSON.stringify(leadsData));
}

export function searchedLeadsData(results) {
	leadsData.searchfilteredLeads = Array.isArray(results) ? results : [];
	resetToFirstPage();
}

// Helper functions
function resetToFirstPage() {
	leadsData.currentPage = 1;
}

function validateCurrentPage() {
	leadsData.currentPage = Math.max(1, Math.min(leadsData.currentPage, leadsData.totalPages));
}

