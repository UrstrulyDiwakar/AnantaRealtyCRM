package com.anantarealty.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.anantarealty.model.Employee;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    
    Employee findByEmployeeName(String employeeName);
    
    // ✅ Fetch multiple employees by name list
    List<Employee> findByEmployeeNameIn(List<String> employeeNames);
    
}