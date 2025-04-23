package com.anantarealty.controller;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.anantarealty.exceptions.ResourceNotFoundException;
import com.anantarealty.model.OutBoundMails;
import com.anantarealty.repository.OutBoundMailsRepository;

@RestController
@RequestMapping("/api/outbound-mails")
public class OutBoundMailController {

    @Autowired
    private OutBoundMailsRepository outboundMailRepository;

    @GetMapping
    public ResponseEntity<List<OutBoundMails>> getAllOutboundMails() {
        try {
            List<OutBoundMails> mails = outboundMailRepository.findAll();
            return ResponseEntity.ok(mails);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<OutBoundMails> getOutboundMailById(@PathVariable Long id) {
        Optional<OutBoundMails> mail = outboundMailRepository.findById(id);
        return mail.map(ResponseEntity::ok)
                   .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    @PatchMapping("/{mailId}/view")
    public ResponseEntity<?> updateMailLastViewedTime(@PathVariable Long mailId) {
        try {
            OutBoundMails mail = outboundMailRepository.findById(mailId)
                .orElseThrow(() -> new ResourceNotFoundException("Mail not found with id: " + mailId));
            
            mail.setLastViewed(LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS));
            outboundMailRepository.save(mail);
            
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error updating last viewed time: " + e.getMessage());
        }
    }

    // Add other endpoints as needed
}
