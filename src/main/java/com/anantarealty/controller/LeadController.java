package com.anantarealty.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.anantarealty.model.Lead;
import com.anantarealty.service.impl.LeadService;

@RestController
@RequestMapping("/api")
public class LeadController {

	@Autowired
	private LeadService leadService;

	@GetMapping("/leads")
	public List<Lead> getAllTheLeads() {
		return leadService.getAllLeads();

	}
	
	@GetMapping("/leadsUser")
	public List<Lead> getLeadsByCurrentUser() {
		System.out.println("********************************************************************");
		List<Lead> l= leadService.getAllLeadsByUser();
		System.out.println(l);
		return l;

	}

//	@GetMapping("/data")
//    public Map<String, Object> getDashboardData() {
//        Map<String, Object> response = new HashMap<>();
//
//        // Leads by Owner
//        List<Map<String, Object>> leadsByOwner = new ArrayList<>();
//        leadsByOwner.add(Map.of("owner", "Lavanya", "count", 150));
//        leadsByOwner.add(Map.of("owner", "Preethi", "count", 20));
//        response.put("leadsByOwner", leadsByOwner);
//
//        // Leads by Stage
//        List<Map<String, Object>> leadsByStage = new ArrayList<>();
//        leadsByStage.add(Map.of("stage", "New", "count", 200));
//        leadsByStage.add(Map.of("stage", "In Progress", "count", 100));
//        leadsByStage.add(Map.of("stage", "Closed", "count", 50));
//        response.put("leadsByStage", leadsByStage);
//
//        // Leads by Source
//        List<Map<String, Object>> leadsBySource = new ArrayList<>();
//        leadsBySource.add(Map.of("source", "Lavanya", "count", 180));
//        leadsBySource.add(Map.of("source", "Preethi", "count", 10));
//        response.put("leadsBySource", leadsBySource);
//
//        // Other data
//        response.put("salesForecast", "No data found");
//        response.put("closedWon", Map.of("count", 300));
//        response.put("closedLost", "No data found");
//
//        return response;
//    }

//	 @GetMapping("/leads")
//	 public List<Lead1> getLeads() {
//        return Arrays.asList(
//            new Lead1(1L, "New", 50000),
//            new Lead1(2L, "Interested", 70000),
//            new Lead1(3L, "Deal Closed", 150000),
//            new Lead1(4L, "Follow Up", 60000),
//            new Lead1(5L, "Contacted", 80000),
//            new Lead1(6L, "Not Interested", 0),
//            new Lead1(7L, "Cancel Lead", 0)
//        );
//    }

}
