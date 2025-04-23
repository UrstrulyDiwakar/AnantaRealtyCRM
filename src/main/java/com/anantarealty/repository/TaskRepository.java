
package com.anantarealty.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.anantarealty.model.Task;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
}
