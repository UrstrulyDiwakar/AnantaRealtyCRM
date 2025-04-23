package com.anantarealty.controller;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.anantarealty.exceptions.ResourceNotFoundException;
import com.anantarealty.model.Lead;
import com.anantarealty.model.Task;
import com.anantarealty.model.TaskStatus;
import com.anantarealty.repository.LeadRepository;
import com.anantarealty.repository.TaskRepository;
import com.anantarealty.service.impl.TaskService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.hibernate.Hibernate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskRepository taskRepository;
    
    @Autowired
    private LeadRepository leadRepository;

    @GetMapping
    public ResponseEntity<?> getAllTasks() {
        try {
            List<Task> tasks = taskRepository.findAll();
            
            // Initialize lazy-loaded relationships
            tasks.forEach(task -> {
                if(task.getLead() != null) {
                    Hibernate.initialize(task.getLead());
                }
            });
            
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error fetching tasks: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTaskById(@PathVariable Long id) {
        try {
            Optional<Task> task = taskRepository.findById(id);
            if (task.isPresent()) {
                // Initialize lazy-loaded relationships
                if(task.get().getLead() != null) {
                    Hibernate.initialize(task.get().getLead());
                }
                return ResponseEntity.ok(task.get());
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error fetching task: " + e.getMessage());
        }
    }
    
    @PatchMapping("/{taskId}/view")
    public ResponseEntity<?> updateTaskLastViewedTime(@PathVariable Long taskId) {
        try {
            Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));
            
            task.setLastViewed(LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS));
            taskRepository.save(task);
            
            return ResponseEntity.ok().build();
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error updating last viewed time: " + e.getMessage());
        }
    }
    
    @PostMapping
    public ResponseEntity<?> createTask(@RequestBody Map<String, Object> taskData) {
        try {
            // Validate required fields
            if (!taskData.containsKey("taskName") || taskData.get("taskName").toString().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Task name is required");
            }

            Task task = new Task();
            task.setTaskName(taskData.get("taskName").toString());
            
            // Set other fields
            if (taskData.containsKey("description")) {
                task.setDescription(taskData.get("description").toString());
            }
            if (taskData.containsKey("status")) {
                task.setStatus(TaskStatus.valueOf(taskData.get("status").toString()));
            }
            if (taskData.containsKey("assignedTo")) {
                task.setAssignedTo(taskData.get("assignedTo").toString());
            }
            if (taskData.containsKey("dueDate")) {
                task.setDueDate(LocalDateTime.parse(taskData.get("dueDate").toString()));
            }

            // Handle lead
            if (taskData.containsKey("lead")) {
                Map<String, Object> leadMap = (Map<String, Object>) taskData.get("lead");
                if (leadMap != null && leadMap.containsKey("leadId")) {
                    Lead lead = new Lead();
                    lead.setLeadId(Long.parseLong(leadMap.get("leadId").toString()));
                    task.setLead(lead);
                }
            }

            // Set formatted timestamps (without nanoseconds)
            LocalDateTime now = LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS);
            task.setCreatedTime(now);
            task.setModifiedTime(now);
            task.setLastViewed(now);

            Task savedTask = taskRepository.save(task);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedTask);

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body("Error creating task: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTask(@PathVariable Long id, @RequestBody Map<String, Object> taskData) {
        try {
            // Check if task exists
            Task existingTask = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));

            // Update fields
            if (taskData.containsKey("taskName")) {
                existingTask.setTaskName(taskData.get("taskName").toString());
            }
            
            if (taskData.containsKey("description")) {
                existingTask.setDescription(taskData.get("description").toString());
            }
            
            if (taskData.containsKey("status")) {
                existingTask.setStatus(TaskStatus.valueOf(taskData.get("status").toString()));
            }
            
            // Handle lead update
            if (taskData.containsKey("lead")) {
                if (taskData.get("lead") != null) {
                    Map<String, Object> leadMap = (Map<String, Object>) taskData.get("lead");
                    existingTask.setLead(leadMap);
                } else {
                    existingTask.setLead((Lead) null); // Explicit cast to avoid ambiguity
                }
            }

            // Update timestamp
            existingTask.setModifiedTime(LocalDateTime.now());

            // Save updates
            Task updatedTask = taskRepository.save(existingTask);
            
            return ResponseEntity.ok(updatedTask);
            
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid status value");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error updating task: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable Long id) {
        try {
            if (!taskRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            
            taskRepository.deleteById(id);
            return ResponseEntity.noContent().build();
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error deleting task: " + e.getMessage());
        }
    }
}
/*
 * @RestController
 * 
 * @RequestMapping("/api/tasks") public class TaskController {
 * 
 * @Autowired private TaskService taskService;
 * 
 * // Get all tasks
 * 
 * @GetMapping public List<Task> getAllTasks() { return
 * taskService.getAllTasks(); }
 * 
 * // Get a specific task by ID
 * 
 * @GetMapping("/{id}") public Task getTaskById(@PathVariable Long id) { return
 * taskService.getTaskById(id); }
 * 
 * // Create a new task
 * 
 * public ResponseEntity<?> createTask(@RequestBody Task task) { try {
 * System.out.println("📥 Received Task Data: " + task);
 * 
 * // ✅ Save Task to DB Task savedTask = taskService.createTask(task);
 * System.out.println("✅ Task Saved Successfully: " + savedTask); return
 * ResponseEntity.ok(savedTask);
 * 
 * } catch (Exception e) { System.err.println("❌ Error Creating Task: " +
 * e.getMessage()); return
 * ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).
 * body("Error creating task."); } }
 * 
 * // Update an existing task
 * 
 * @PutMapping("/{id}") public Task updateTask(@PathVariable Long
 * id, @RequestBody Task updatedTask) { if (updatedTask != null) return
 * taskService.updateTask(id, updatedTask); else return null;
 * 
 * }
 * 
 * // Delete a task
 * 
 * @DeleteMapping("/{id}") public void deleteTask(@PathVariable Long id) {
 * taskService.deleteTask(id); } }
 */