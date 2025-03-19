package com.anantarealty.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.anantarealty.model.Organization;
import com.anantarealty.repository.OrganizationRepo;

@Service
public class OrganizationService {
	
	@Autowired
	private OrganizationRepo organizationRepo;
	
	
	public Organization saveOrganization(Organization organization) {
		return organizationRepo.save(organization);
	}

}
