package com.anantarealty.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.anantarealty.model.LeadImportHistory;

public interface ImportHistoryRepository extends JpaRepository<LeadImportHistory, Long> {

}
