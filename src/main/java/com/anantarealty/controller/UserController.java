package com.anantarealty.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.anantarealty.model.User;
import com.anantarealty.repository.UserRepository;
import com.anantarealty.service.UserDetailsServiceImpl;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.stream.Collectors;
import java.util.HashMap;
import java.util.Map;
import com.anantarealty.model.Profile;


@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:8085") // ✅ Allow frontend access
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    // ✅ Handles JSON and Form submissions correctly
    @PostMapping(value = "/adduser", consumes = "application/json")
    public ResponseEntity<?> createUser(@RequestBody User user) {
        try {
            logger.info("Received user creation request: {}", user);
            User savedUser = userDetailsService.saveUser(user);
            logger.info("User saved successfully with ID: {}", savedUser.getUserid());

            return ResponseEntity.ok("✅ User saved successfully!");
        } catch (Exception e) {
            logger.error("❌ Error saving user: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body("Error saving user: " + e.getMessage());
        }
    }

    // ✅ Debugging endpoint to check if API is reachable
    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("✅ API is up and running!");
    }
    
    @Autowired
    private UserRepository userRepository;

    // ✅ New API: Fetch all users with required attributes
    @GetMapping("/getUsers")
    public ResponseEntity<List<Map<String, Object>>> getUsersList() {
        List<Map<String, Object>> usersList = userRepository.findAll().stream().map(user -> {
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("username", user.getUsername()); // Assuming 'username' is the NAME field
            userMap.put("email", user.getEmail());
            userMap.put("mobile", user.getMobile());
            userMap.put("profile", user.getProfile());
            userMap.put("reportingTo", user.getReportingTo());

            return userMap;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(usersList);
    }
    
    @Autowired
    private UserRepository repository;
    
    @GetMapping("/checkProfile")
    public boolean checkProfile() {
    	if (repository.findByemail(userDetailsService.getLoginUser()).getProfile().equals(Profile.ADMIN)) {
    		return true;
    	} else return false;
    	
    }
    
}