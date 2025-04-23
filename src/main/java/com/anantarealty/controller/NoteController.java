package com.anantarealty.controller;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
import com.anantarealty.model.Notes;
import com.anantarealty.repository.LeadRepository;
import com.anantarealty.repository.NotesRepository;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    @Autowired
    private NotesRepository noteRepository;
    
    @Autowired
    private LeadRepository leadRepository;


    @GetMapping
    public ResponseEntity<List<Notes>> getAllNotes() {
        try {
            List<Notes> notes = noteRepository.findAll();
            
            // Eagerly fetch lead information
            notes.forEach(note -> {
                if(note.getLead() != null) {
                    Hibernate.initialize(note.getLead());
                }
            });
            
            return ResponseEntity.ok(notes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Notes> getNoteById(@PathVariable Long id) {
        Optional<Notes> note = noteRepository.findById(id);
        return note.map(ResponseEntity::ok)
                  .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    
    @PatchMapping("/{noteId}/view")
    public ResponseEntity<?> updateNoteLastViewedTime(@PathVariable Long noteId) {
        try {
            Notes note = noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found with id: " + noteId));
            
            note.setLastViewed(LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS));
            noteRepository.save(note);
            
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error updating last viewed time: " + e.getMessage());
        }
    }
    
	/*
	 * @PostMapping public ResponseEntity<?> createNote(@RequestBody Map<String,
	 * Object> noteData) { try { // Validate required fields if
	 * (!noteData.containsKey("note") ||
	 * noteData.get("note").toString().trim().isEmpty()) { return
	 * ResponseEntity.badRequest().body("Note content is required"); }
	 * 
	 * Notes note = new Notes(); note.setNote(noteData.get("note").toString());
	 * 
	 * // Set other fields if (noteData.containsKey("createdBy")) {
	 * note.setCreatedBy(noteData.get("createdBy").toString()); } if
	 * (noteData.containsKey("opportunity")) {
	 * note.setOpportunity(noteData.get("opportunity").toString()); }
	 * 
	 * // Handle lead if (noteData.containsKey("lead")) { Map<String, Object>
	 * leadMap = (Map) noteData.get("lead"); if (leadMap != null &&
	 * leadMap.containsKey("leadId")) { Lead lead = new Lead();
	 * lead.setLeadId(Long.parseLong(leadMap.get("leadId").toString()));
	 * note.setLead(lead); } }
	 * 
	 * // Set formatted timestamps LocalDateTime now =
	 * LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS);
	 * note.setCreatedTime(now); note.setModifiedTime(now); note.setLastViewed(now);
	 * 
	 * Notes savedNote = noteRepository.save(note); return
	 * ResponseEntity.status(HttpStatus.CREATED).body(savedNote);
	 * 
	 * } catch (Exception e) { return ResponseEntity.internalServerError()
	 * .body("Error creating note: " + e.getMessage()); } }
	 */
    @PostMapping
    public ResponseEntity<?> createNote(@RequestBody Map<String, Object> noteData) {
        try {
            // Validate required field
            if (noteData.get("note") == null || noteData.get("note").toString().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Note content is required");
            }

            Notes note = new Notes();
            note.setNote(noteData.get("note").toString());
            
            // Set simple fields
            Optional.ofNullable(noteData.get("createdBy")).ifPresent(v -> note.setCreatedBy(v.toString()));
            Optional.ofNullable(noteData.get("opportunity")).ifPresent(v -> note.setOpportunity(v.toString()));

            // Handle lead in one line
            Optional.ofNullable(noteData.get("lead"))
                .ifPresent(lead -> note.setLeadFromMap((Map<String, Object>) lead));

            // Set timestamps
            LocalDateTime now = LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS);
            note.setCreatedTime(now);
            note.setModifiedTime(now);
            note.setLastViewed(now);

            return ResponseEntity.status(HttpStatus.CREATED).body(noteRepository.save(note));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body("Error creating note: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateNote(@PathVariable Long id, @RequestBody Map<String, Object> noteData) {
        try {
            Notes note = noteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found"));

            // Update fields if present
            Optional.ofNullable(noteData.get("note")).ifPresent(v -> note.setNote(v.toString()));
            Optional.ofNullable(noteData.get("createdBy")).ifPresent(v -> note.setCreatedBy(v.toString()));
            Optional.ofNullable(noteData.get("opportunity")).ifPresent(v -> note.setOpportunity(v.toString()));

            // Handle lead - will set to null if lead key exists with null value
            if (noteData.containsKey("lead")) {
                note.setLeadFromMap((Map<String, Object>) noteData.get("lead"));
            }

            note.setModifiedTime(LocalDateTime.now());
            return ResponseEntity.ok(noteRepository.save(note));

        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body("Error updating note: " + e.getMessage());
        }
    }
    // Add other endpoints as needed
}
