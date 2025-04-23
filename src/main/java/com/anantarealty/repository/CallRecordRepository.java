package com.anantarealty.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.anantarealty.model.CallRecord;

public interface CallRecordRepository extends JpaRepository<CallRecord, Long> {
	

	List<CallRecord> findByStartTimeBetween(LocalDateTime start, LocalDateTime end);

}
