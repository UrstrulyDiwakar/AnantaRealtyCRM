package com.anantarealty.controller;

import ch.qos.logback.classic.Logger;

import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.anantarealty.model.Task;
import com.anantarealty.repository.TaskRepository;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskRepository taskRepository;
    private static final Logger logger = (Logger) LoggerFactory.getLogger(TaskController.class);
    // Get all tasks
    @GetMapping
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    // Get a specific task by ID
    @GetMapping("/{id}")
    public Task getTaskById(@PathVariable Long id) {
        return taskRepository.findById(id).orElse(null);
    }

    // Create a new task
    @PostMapping
    public Task createTask(@RequestBody Task task) {
        return taskRepository.save(task);
    }

    // Update an existing task
    @PutMapping("/{id}")
    public Task updateTask(@PathVariable Long id, @RequestBody Task task) {
        task.setTaskId(id);
        return taskRepository.save(task);
    }

    // Delete a task
    @DeleteMapping("/{id}")
    public void deleteTask(@PathVariable Long id) {
        taskRepository.deleteById(id);
    }
}
