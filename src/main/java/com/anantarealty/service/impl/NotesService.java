package com.anantarealty.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.anantarealty.model.Notes;
import com.anantarealty.repository.NotesRepository;

@Service
public class NotesService {
	
	@Autowired
	private NotesRepository notesRepository;
	
	public List<Notes> getAllNotes(){
		return notesRepository.findAll();
	}

}
