package com.anantarealty.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.anantarealty.model.DailyCallSummary;
import com.anantarealty.model.User;
import com.anantarealty.repository.DailyCallSummaryRepository;
import com.anantarealty.repository.UserRepository;
import com.anantarealty.service.impl.CallTrackingService;

@RestController
@RequestMapping("/api/calls")
public class CallTrackingController {

    @Autowired
    private CallTrackingService callTrackingService;

    @Autowired
    private DailyCallSummaryRepository dailyCallSummaryRepository;

    @Autowired
    private UserRepository userRepository;
   

    // ✅ Corrected API: Get daily summary for multiple employees and date range
    @GetMapping("/summary")
    public ResponseEntity<List<DailyCallSummary>> getDailySummary(
            @RequestParam(required = false) List<String> userNames,
            @RequestParam String startDate,
            @RequestParam String endDate) {

        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);

        List<DailyCallSummary> summaries;
        
        if (userNames == null || userNames.isEmpty()) {
            summaries = dailyCallSummaryRepository.findByCallDateBetween(start, end);
        } else {
            List<User> users = userRepository.findByusernameIn(userNames);
            summaries = dailyCallSummaryRepository.findByUserInAndCallDateBetween(users, start, end);
        }

        return ResponseEntity.ok(summaries);
    }


   
}
