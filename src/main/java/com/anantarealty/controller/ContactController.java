package com.anantarealty.controller;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

import org.hibernate.Hibernate;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.anantarealty.exceptions.ResourceNotFoundException;
import com.anantarealty.model.Contacts;
import com.anantarealty.repository.ContactsRepository;

@RestController
@RequestMapping("/api/contacts")
public class ContactController {

    @Autowired
    private ContactsRepository contactRepository;

    @GetMapping
    public ResponseEntity<List<Contacts>> getAllContacts() {
        try {
            List<Contacts> contacts = contactRepository.findAll();
            
            // Eagerly fetch lead information
            contacts.forEach(contact -> {
                if(contact.getLead() != null) {
                    Hibernate.initialize(contact.getLead());
                }
            });
            
            return ResponseEntity.ok(contacts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Contacts> getContactById(@PathVariable Long id) {
        Optional<Contacts> contact = contactRepository.findById(id);
        return contact.map(ResponseEntity::ok)
                     .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    @PatchMapping("/{contactId}/view")
    public ResponseEntity<?> updateContactLastViewedTime(@PathVariable Long contactId) {
        try {
            Contacts contact = contactRepository.findById(contactId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found with id: " + contactId));
            
            contact.setLastViewed(LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS));
            contactRepository.save(contact);
            
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error updating last viewed time: " + e.getMessage());
        }
    }

    // Add other endpoints as needed
}