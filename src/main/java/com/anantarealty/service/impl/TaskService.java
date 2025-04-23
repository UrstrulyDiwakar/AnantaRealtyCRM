package com.anantarealty.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.anantarealty.model.Task;
import com.anantarealty.repository.TaskRepository;

@Service
public class TaskService {

	@Autowired
	private TaskRepository taskRepository;

	public List<Task> getAllTasks() {
		return taskRepository.findAll();
	}

	public Task getTaskById(Long id) {
		return taskRepository.findById(id).orElse(null);
	}

	// Create a new task
	public Task createTask(Task task) {
		try {
			System.out.println("📥 Received Task Data: " + task);

			// ✅ Save Task to DB
			Task savedTask = taskRepository.save(task);
			System.out.println("✅ Task Saved Successfully: " + savedTask);
			return savedTask;

		} catch (Exception e) {
			System.err.println("❌ Error Creating Task: " + e.getMessage());
			return null;
		}
	}

	// Update an existing task
	public Task updateTask(Long id, Task updatedTask) {
		if (updatedTask != null)
			return taskRepository.save(updatedTask);
		else
			return null;

	}

	// Delete a task
	public void deleteTask(Long id) {
		taskRepository.deleteById(id);
	}

}