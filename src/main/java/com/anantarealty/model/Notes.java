package com.anantarealty.model;

import java.time.LocalDateTime;
import java.util.Map;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;

@Entity
public class Notes {
	
	@Id
	@GeneratedValue(strategy =  GenerationType.IDENTITY)
	private Long noteID;
	
	private String note;
	private String createdBy;
	
	@OneToOne
	@JoinColumn(name = "lead_id")
	private Lead lead;
	
	private String opportunity;
	
	private LocalDateTime createdTime;
	private LocalDateTime modifiedTime;
	private LocalDateTime lastViewed;
	
	// Replace setLead with these two methods:
    public void setLeadFromMap(Map<String, Object> leadMap) {
        if (leadMap == null || !leadMap.containsKey("leadId")) {
            this.lead = null;
            return;
        }
        
        // Create minimal Lead with just ID (avoids full database fetch)
        this.lead = new Lead();
        this.lead.setLeadId(Long.parseLong(leadMap.get("leadId").toString()));
    }

   
	
	public Long getNoteID() {
		return noteID;
	}
	public void setNoteID(Long noteID) {
		this.noteID = noteID;
	}
	public String getNote() {
		return note;
	}
	public void setNote(String note) {
		this.note = note;
	}
	public String getCreatedBy() {
		return createdBy;
	}
	public void setCreatedBy(String createdBy) {
		this.createdBy = createdBy;
	}
	public Lead getLead() {
		return lead;
	}
	public void setLead(Lead lead) {
		this.lead = lead;
	}
	public String getOpportunity() {
		return opportunity;
	}
	public void setOpportunity(String opportunity) {
		this.opportunity = opportunity;
	}
	public LocalDateTime getCreatedTime() {
		return createdTime;
	}
	public void setCreatedTime(LocalDateTime createdTime) {
		this.createdTime = createdTime;
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
		return "Notes [noteID=" + noteID + ", note=" + note + ", createdBy=" + createdBy + ", lead=" + lead
				+ ", opportunity=" + opportunity + ", createdTime=" + createdTime + ", modifiedTime=" + modifiedTime
				+ ", lastViewdTime=" + lastViewed + "]";
	}
	
	

}
