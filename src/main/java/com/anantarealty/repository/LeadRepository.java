package com.anantarealty.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.anantarealty.model.Lead;

@Repository
public interface LeadRepository  extends JpaRepository<Lead, Long>{
	
	@Query(value = "SELECT * FROM lead l WHERE l.lead_owner IN (SELECT u.username FROM users u where u.reporting_to= :email)" , nativeQuery = true)
	List<Lead> findLeadsByManager(@Param("email") String email);
	
//	@Query("SELECT l FROM Lead l WHERE l.leadOwner")
//	List<Lead> findLeadsByEmaployee(@Param("leadOwner") String leadOwner);
	
	//fetch leads by leadOwners list for manager login
	List<Lead> findByLeadOwnerIn(List<String> leadowner);
	
	//fetch leads for employee
	List<Lead> findByLeadOwner(String leadOwnerName);
	
}
