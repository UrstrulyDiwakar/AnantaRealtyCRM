
package com.anantarealty.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.anantarealty.model.Task;

public interface TaskRepository extends JpaRepository<Task, Long> {
}
