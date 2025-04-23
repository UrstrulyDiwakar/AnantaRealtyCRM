package com.anantarealty.model;

import java.time.LocalDateTime;
import java.util.Map;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class Task {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long taskId;
	private String taskName;
	private String description;
	
	@Enumerated(EnumType.STRING)
	private TaskStatus status;
	private LocalDateTime dueDate;
	private String assignedTo;

	@ManyToOne
	@JoinColumn(name = "lead_id")
	private Lead lead;
	
	private String comments;
	
	private LocalDateTime createdTime;
	private LocalDateTime modifiedTime;
	private LocalDateTime lastViewed;
	
	private String oppurtunity;
	
	private String referenceLink;
	
	
	// Add this to properly handle JSON deserialization
	public void setLead(Map<String, Object> leadMap) {
	    if (leadMap != null && leadMap.containsKey("leadId")) {
	        this.lead = new Lead();
	        this.lead.setLeadId(Long.parseLong(leadMap.get("leadId").toString()));
	    }
	}
	
	public Long getTaskId() {
		return taskId;
	}

	public void setTaskId(Long taskId) {
		this.taskId = taskId;
	}

	public String getTaskName() {
		return taskName;
	}

	public void setTaskName(String taskName) {
		this.taskName = taskName;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public TaskStatus getStatus() {
		return status;
	}

	public void setStatus(TaskStatus status) {
		this.status = status;
	}

	public LocalDateTime getDueDate() {
		return dueDate;
	}

	public void setDueDate(LocalDateTime dueDate) {
		this.dueDate = dueDate;
	}

	public String getAssignedTo() {
		return assignedTo;
	}

	public void setAssignedTo(String assignedTo) {
		this.assignedTo = assignedTo;
	}

	public Lead getLead() {
		return lead;
	}

	public void setLead(Lead lead) {
		this.lead = lead;
	}

	public String getComments() {
		return comments;
	}

	public void setComments(String comments) {
		this.comments = comments;
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


	public String getOppurtunity() {
		return oppurtunity;
	}

	public void setOppurtunity(String oppurtunity) {
		this.oppurtunity = oppurtunity;
	}

	public String getReferenceLink() {
		return referenceLink;
	}

	public void setReferenceLink(String referenceLink) {
		this.referenceLink = referenceLink;
	}
	

	public LocalDateTime getLastViewed() {
		return lastViewed;
	}

	public void setLastViewed(LocalDateTime lastViewed) {
		this.lastViewed = lastViewed;
	}

	@Override
	public String toString() {
		return "Task [taskId=" + taskId + ", taskName=" + taskName + ", description=" + description + ", status="
				+ status + ", dueDate=" + dueDate + ", assignedTo=" + assignedTo + ", lead=" + lead + ", comments="
				+ comments + ", createdTime=" + createdTime + ", modifiedTime=" + modifiedTime + ", lastViewedTime="
				+ lastViewed + ", oppurtunity=" + oppurtunity + ", referenceLink=" + referenceLink + "]";
	}
	
	//getters and setters
	
	
	

}
