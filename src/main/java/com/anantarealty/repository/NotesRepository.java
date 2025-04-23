package com.anantarealty.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.anantarealty.model.Notes;

@Repository
public interface NotesRepository  extends JpaRepository<Notes, Long>{

}
