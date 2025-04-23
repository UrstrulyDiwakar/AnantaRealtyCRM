package com.anantarealty.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.anantarealty.model.DailyCallSummary;
import com.anantarealty.model.User;

@Repository
public interface DailyCallSummaryRepository extends JpaRepository<DailyCallSummary, Long> {
    
    // ✅ Get summaries for a specific employee and date
    List<DailyCallSummary> findByUserAndCallDate(User user, LocalDate callDate);

    // ✅ Get summaries for all employees in a date range
    List<DailyCallSummary> findByCallDateBetween(LocalDate startDate, LocalDate endDate);

    // ✅ Get summaries for selected employees in a date range
    List<DailyCallSummary> findByUserInAndCallDateBetween(List<User> users, LocalDate startDate, LocalDate endDate);
}
