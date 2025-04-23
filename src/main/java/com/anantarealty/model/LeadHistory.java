package com.anantarealty.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;

@Entity
public class LeadHistory {

	 @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    private Long leadHistoryId;
	    
	    @Column(nullable = false)
	    private LocalDateTime leadCreation;
	    
	    @Column(nullable = false)
	    private LocalDateTime modifiedTime;
	    
	    private LocalDateTime lastViewed;

	    // Add this constructor
	    public LeadHistory() {
	        this.leadCreation = LocalDateTime.now();
	        this.modifiedTime = LocalDateTime.now();
	    }

	    // Add this lifecycle callback for extra safety
	    @PrePersist
	    @PreUpdate
	    protected void onPersistOrUpdate() {
	        if (this.leadCreation == null) {
	            this.leadCreation = LocalDateTime.now();
	        }
	        if (this.modifiedTime == null) {
	            this.modifiedTime = LocalDateTime.now();
	        }
	    }

	public Long getLeadHistoryId() {
		return leadHistoryId;
	}

	public void setLeadHistoryId(Long leadHistoryId) {
		this.leadHistoryId = leadHistoryId;
	}

	public LocalDateTime getLeadCreation() {
		return leadCreation;
	}

	public void setLeadCreation(LocalDateTime leadCreation) {
		this.leadCreation = leadCreation;
	}

	public LocalDateTime getModifiedTime() {
		return modifiedTime;
	}

	public void setModifiedTime(LocalDateTime modifiedTime) {
		this.modifiedTime = modifiedTime;
	}

	public LocalDateTime getLastViewed() {
		return lastViewed;
	}

	public void setLastViewed(LocalDateTime lastViewed) {
		this.lastViewed = lastViewed;
	}

	@Override
	public String toString() {
		return "LeadHistory [leadHistoryId=" + leadHistoryId + ", leadCreation=" + leadCreation + ", modifiedTime="
				+ modifiedTime + ", lastViewed=" + lastViewed + "]";
	}

}
