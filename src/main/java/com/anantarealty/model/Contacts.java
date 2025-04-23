package com.anantarealty.model;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;

@Entity
public class Contacts {
	
	@Id
	@GeneratedValue(strategy =  GenerationType.IDENTITY)
	private Long contactID;
	
	private LocalDateTime createdTime;
	private LocalDateTime modifiedTime;
	private LocalDateTime lastViewed;
	
	@OneToOne
	@JoinColumn(name = "lead_id")
	private Lead lead;
	
	private boolean isBloked;
	
	private boolean optIn;
	
	private LocalDateTime lastDelivered;
	private LocalDateTime lastRead;
	private LocalDateTime lastReplied;
	private LocalDateTime lastSend;
	
	
	public Long getContactID() {
		return contactID;
	}
	public void setContactID(Long contactID) {
		this.contactID = contactID;
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
	public Lead getLead() {
		return lead;
	}
	public void setLead(Lead lead) {
		this.lead = lead;
	}
	public boolean isBloked() {
		return isBloked;
	}
	public void setBloked(boolean isBloked) {
		this.isBloked = isBloked;
	}
	public boolean isOptIn() {
		return optIn;
	}
	public void setOptIn(boolean optIn) {
		this.optIn = optIn;
	}
	public LocalDateTime getLastDelivered() {
		return lastDelivered;
	}
	public void setLastDelivered(LocalDateTime lastDelivered) {
		this.lastDelivered = lastDelivered;
	}
	public LocalDateTime getLastRead() {
		return lastRead;
	}
	public void setLastRead(LocalDateTime lastRead) {
		this.lastRead = lastRead;
	}
	public LocalDateTime getLastReplied() {
		return lastReplied;
	}
	public void setLastReplied(LocalDateTime lastReplied) {
		this.lastReplied = lastReplied;
	}
	public LocalDateTime getLastSend() {
		return lastSend;
	}
	public void setLastSend(LocalDateTime lastSend) {
		this.lastSend = lastSend;
	}
	@Override
	public String toString() {
		return "Contacts [contactID=" + contactID + ", createdTime=" + createdTime + ", modifiedTime=" + modifiedTime
				+ ", lastViewedTime=" + lastViewed + ", lead=" + lead + ", isBloked=" + isBloked + ", optIn="
				+ optIn + ", lastDelivered=" + lastDelivered + ", lastRead=" + lastRead + ", lastReplied=" + lastReplied
				+ ", lastSend=" + lastSend + "]";
	}
	
	
	

}
