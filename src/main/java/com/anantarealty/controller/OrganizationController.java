package com.anantarealty.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.anantarealty.model.Organization;
import com.anantarealty.service.OrganizationService;

import java.util.Map;

@RestController
@RequestMapping("/api/organization")
@CrossOrigin(origins = { "http://127.0.0.1:5501", "http://localhost:5501" }) // ✅ Allow frontend origins
public class OrganizationController {
	@Autowired
	private OrganizationService organizationService;

	@PostMapping
	public ResponseEntity<Map<String, Object>> saveOrg(@RequestBody Map<String, Object> orgData) {

		//orgData.forEach((key, value) -> System.out.println(key + " : " + value));
		 Organization organization=organizationService.saveOrganization(convertToOrg(orgData));

		return ResponseEntity.ok().body(orgData);
	}

	private Organization convertToOrg(Map<String, Object> orgData) {

		Organization organization = new Organization();
		organization.setoId(0);
		organization.setCompanyName((String) orgData.get("companyName"));
		organization.setApplicationTitle((String) orgData.get("applicationTitle"));
		organization.setWebSite((String) orgData.get("website"));
		organization.setPhoneNumber((String) orgData.get("phone"));
		organization.setPanNumber((String) orgData.get("panNo"));
		organization.setGstIn((String) orgData.get("gstIn"));
		
		
		
Map<String, String >m= 	(Map<String, String>) orgData.get("billingContact");
//m.forEach((key, value) -> System.out.println(key + " : " + value));
		

		organization.setName((String) m.get("name"));
		organization.setDesignation((String) m.get("designation"));
		organization.setEmail((String) m.get("email"));
		organization.setMobileNumber((String) m.get("mobile"));
		
		
		Map<String, String >n= 	(Map<String, String>) orgData.get("addressInfo");

		organization.setStreet1((String) n.get("street1"));
		organization.setStreet2((String) n.get("street2"));
		organization.setCity((String) n.get("city"));
		organization.setState((String) n.get("state"));
		organization.setPincode((String) n.get("pinCode"));
		organization.setCountry((String) n.get("country"));

		return organization;

	}
}