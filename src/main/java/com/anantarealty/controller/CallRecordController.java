package com.anantarealty.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.anantarealty.model.CallRecord;
import com.anantarealty.repository.CallRecordRepository;

@RestController
@RequestMapping("/api/call-records")
public class CallRecordController {
	@Autowired
    private CallRecordRepository callRecordRepository;
    
    

    @GetMapping
    public ResponseEntity<List<CallRecord>> getAllCallRecords(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        LocalDateTime start = startDate != null ? LocalDateTime.parse(startDate) : null;
        LocalDateTime end = endDate != null ? LocalDateTime.parse(endDate) : null ;
        
        List<CallRecord> records;
        if (start != null && end != null) {
            records = callRecordRepository.findByStartTimeBetween(start, end);
        } else {
            records = callRecordRepository.findAll();
        }
        
        // Initialize lazy-loaded user relationships
        records.forEach(record -> Hibernate.initialize(record.getUser()));
            
        return ResponseEntity.ok(records);
    }
}
