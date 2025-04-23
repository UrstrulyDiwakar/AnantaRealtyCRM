package com.anantarealty.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.jfree.util.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.anantarealty.model.Lead;
import com.anantarealty.model.LeadHistory;
import com.anantarealty.service.impl.LeadService;
import com.anantarealty.service.impl.LeadService.BulkImportResult;
import com.anantarealty.repository.LeadRepository;

@RestController
@RequestMapping("/api")
public class LeadController {

	
	//*****  STARTED added  Srinath code
	
	@Autowired
	private LeadService leadService;
	private final LeadRepository leadRepository; // ✅ Use instance variable

    public LeadController(LeadRepository leadRepository) {
        this.leadRepository = leadRepository;
    }
  //*****  ENDED added  Srinath code
    
    
	
//	@Autowired
//	private LeadService leadService;   ********** comented because of duplicated changes because of srinath code **********

	// fetch all the leads which are present in database
	@GetMapping("/leads")
	public List<Lead> getAllTheLeads() {
		//System.out.println(leadService.getAllLeads());
		//return leadService.getAllLeads();    OLD CODE
		
		
		 List<Lead> leads = leadService.getAllLeads();
		 return leads;

	}

	// fetch leads based on user who are currently logged in
	@GetMapping("/leadsUser")
	public List<Lead> getLeadsByCurrentUser() {
		List<Lead> l = leadService.getAllLeadsByUser();
		//System.out.println(l);
		return l;

	}

	// this method will delete the leads in leads table based on lead Id's
	@DeleteMapping("/delete")
	public ResponseEntity<String> deleteLeads(@RequestBody List<Long> leadIds) {
		if (leadIds == null || leadIds.isEmpty()) {
			return new ResponseEntity<>("No lead IDs provided", HttpStatus.BAD_REQUEST);
		}

		try {
			leadService.deleteLeads(leadIds);
			return new ResponseEntity<>("Leads deleted successfully", HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>("Failed to delete leads: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@DeleteMapping("/deleteOneLead")
	public ResponseEntity<String> deleteOnelead(@RequestBody Lead lead) {
		if (lead == null || lead.getLeadId() == null) {
			return new ResponseEntity<>("No lead provided or lead ID is missing", HttpStatus.BAD_REQUEST);
		}

		try {
			// Assuming you have a service to handle deletion
			leadService.deleteLead(lead.getLeadId());
			System.out.println(lead);
			return new ResponseEntity<>("Lead deleted successfully", HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>("Failed to delete lead: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	// to add the new lead into the Database
	@PostMapping("/add")
	public ResponseEntity<String> addLead(@RequestBody Lead lead) {
		leadService.addLead(lead);
		return ResponseEntity.ok("Lead added successfully!");
	}

	// Get list of leadStages which are present in database
	@GetMapping("/leadstages")
	public ResponseEntity<Set<String>> getLeadStages() {
		Set<String> leadStages = leadService.getLeadStages();
		System.out.println(leadStages);
		return ResponseEntity.ok(leadStages);
	}

//	// fetch lead by lead Id
//	@GetMapping("/{id}")
//	public ResponseEntity<Lead> getLeadById(@PathVariable Long id) {
//		try {
//			Lead lead = leadService.fetchLead(id);
//			if (lead != null) {
//				return ResponseEntity.ok(lead);
//			} else {
//				return ResponseEntity.notFound().build();
//			}
//		} catch (Exception e) {
//			return ResponseEntity.internalServerError().build();
//		}
//	}
//	
//	// ✅ Fetch Lead by leadId    ***********  added srinath code to fetch leads ***********  START
//		@GetMapping("/leads/{id}")
//		public ResponseEntity<Lead> getLeadById(@PathVariable Long id) {
//		    Optional<Lead> lead = leadRepository.findById(id);
//		    return lead.map(ResponseEntity::ok)
//		               .orElseGet(() -> ResponseEntity.notFound().build());
//		}
//	
//		// ✅ Fetch Lead by leadId    ***********  added srinath code to fetch leads ***********  END
	
	
	
	@GetMapping({"/leads/{id}", "/{id}"})
	public ResponseEntity<Lead> getLeadById(@PathVariable Long id) {
	    try {
	        Optional<Lead> lead = leadRepository.findById(id);
	        return lead.map(ResponseEntity::ok)
	                   .orElseGet(() -> ResponseEntity.notFound().build());
	    } catch (Exception e) {
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
	    }
	}

	

	@GetMapping("/{leadId}")
	public ResponseEntity<Lead> getLead(@PathVariable Long leadId) {
		Lead lead = leadService.fetchLead(leadId);
		return ResponseEntity.ok(lead);
	}

	@PutMapping("/update")
	public ResponseEntity<String> updateLead(@RequestBody Lead lead) {

		System.out.println(lead);

		if (lead.getLeadId() == null) {
			return ResponseEntity.badRequest().body("Lead ID is required");
		}
		leadService.updateLead(lead.getLeadId(), lead);
		return ResponseEntity.ok("Lead updated");
	}

	@PutMapping("/{leadId}")
	public ResponseEntity<Lead> updateLead(@PathVariable Long leadId, @RequestBody Lead lead) {
		System.out.println(lead);

		if (lead == null || !leadId.equals(lead.getLeadId())) {
			return ResponseEntity.badRequest().build();
		}

		// Ensure leadHistory exists and set modified time
		if (lead.getLeadHistory() == null) {
			lead.setLeadHistory(new LeadHistory());
		}
		lead.getLeadHistory().setModifiedTime(LocalDateTime.now());

		Lead updatedLead = leadService.updateLead(lead);
		return ResponseEntity.ok(updatedLead);
	}

	@PatchMapping("/{leadId}/history")
	public ResponseEntity<Lead> updateLeadHistory(@PathVariable Long leadId, @RequestBody LeadHistory leadHistory) {
		System.out.println(leadHistory);
		Lead updatedLead = leadService.updateLeadHistory(leadId, leadHistory);
		return ResponseEntity.ok(updatedLead);
	}

	@DeleteMapping("/{leadId}")
	public ResponseEntity<String> deleteLead(@PathVariable Long leadId) {
		leadService.deleteLead(leadId);
		return ResponseEntity.ok("Lead deleted");
	}

	// Bulk lead import endpoint
	@PostMapping("/import")
	public ResponseEntity<?> importBulkLeads(@RequestBody List<Lead> leads, 
	                                       @RequestParam(required = false) String filename) {
		System.out.println(leads.size());
		leads.stream().forEach(lead -> System.out.println(lead));
		
	    try {
	        if (leads == null || leads.isEmpty()) {
	            return ResponseEntity.badRequest()
	                .body(Map.of("status", "error", 
	                            "message", "No leads provided",
	                            "errorType", "VALIDATION_ERROR"));
	        }
	        
	        if (leads.size() > 1000000) {
	            return ResponseEntity.badRequest()
	                .body(Map.of("status", "error", 
	                            "message", "Maximum 1000 leads per import allowed",
	                            "errorType", "VALIDATION_ERROR"));
	        }
	        
	        BulkImportResult result = leadService.processLeads(leads, filename);
	        return ResponseEntity.ok(result);
	        
	    } catch (Exception e) {
	        Log.error("Import failed", e);
	        return ResponseEntity.internalServerError()
	            .body(Map.of("status", "error", 
	                        "message", "Import failed: " + e.getMessage(),
							"errorType", "SERVER_ERROR"));
		}
	}

	@PutMapping("bulk-update")
	public ResponseEntity<?> updateBulkLeads(@RequestBody List<Lead> leads) {
		//System.out.println(leads);
		return leadService.bulkLeadsMassUpdate(leads);
	}

}
