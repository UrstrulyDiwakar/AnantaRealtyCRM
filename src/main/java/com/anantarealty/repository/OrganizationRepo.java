package com.anantarealty.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.anantarealty.model.Organization;

@Repository
public interface OrganizationRepo extends JpaRepository<Organization, Long> {

}
