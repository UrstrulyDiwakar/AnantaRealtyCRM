package com.anantarealty.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.anantarealty.model.CallLog;
import com.anantarealty.model.CallType;
import com.anantarealty.model.DailyCallSummary;
import com.anantarealty.model.User;
import com.anantarealty.repository.CallLogRepository;
import com.anantarealty.repository.DailyCallSummaryRepository;

import com.anantarealty.repository.UserRepository;

import java.time.LocalDate;
import java.util.List;

@Service
public class CallTrackingService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CallLogRepository callLogRepository;

    @Autowired
    private DailyCallSummaryRepository dailyCallSummaryRepository;

    // Get daily summary for a caller
    public DailyCallSummary getDailySummary(String userName, LocalDate date) {
        User user = userRepository.findByemail(userName);

        if (user == null) {
            throw new RuntimeException("user not found: " + userName);
        }

        return dailyCallSummaryRepository.findByUserAndCallDate(user, date)
                .stream().findFirst().orElse(null);
    }

    // Create daily summary from call logs
    public void generateDailySummary(LocalDate date) {
        List<User> users = userRepository.findAll();
        
      
		for (User user : users) {
            List<CallLog> logs = callLogRepository.findByUserAndCallDate(user, date);

            int dialedCalls = (int) logs.stream().filter(log -> log.getCallType() == CallType.DIALED).count();
            int receivedCalls = (int) logs.stream().filter(log -> log.getCallType() == CallType.RECEIVED).count();
            int missedCalls = (int) logs.stream().filter(log -> log.getCallType() == CallType.MISSED).count();
            
            long totalDuration = logs.stream()
                    .filter(log -> log.getDuration() != null)
                    .mapToLong(CallLog::getDuration)
                    .sum();
            
            long longestCall = logs.stream()
                    .mapToLong(CallLog::getDuration)
                    .max()
                    .orElse(0L);

            DailyCallSummary summary = new DailyCallSummary();
            summary.setUser(user);
            summary.setCallDate(date);
            summary.setDialedCalls(dialedCalls);
            summary.setReceivedCalls(receivedCalls);
            summary.setMissedCalls(missedCalls);
            summary.setTotalDuration(totalDuration);
            summary.setLongestCall(longestCall);

            dailyCallSummaryRepository.save(summary);
        }
    }
}
