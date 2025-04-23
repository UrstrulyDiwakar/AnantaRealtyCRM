package com.anantarealty.model;


import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(name = "lead_import_history")
public class LeadImportHistory {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private LocalDateTime importDate;
	private String fileName;
	private int recordsCreated;
	private int recordsUpdated;
	private int recordsIgnored;
	private String status;
	private String updatedBy;
	private LocalDateTime updatedTime;

	// Getters and Setters
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public LocalDateTime getImportDate() {
		return importDate;
	}

	public void setImportDate(LocalDateTime importDate) {
		this.importDate = importDate;
	}

	public String getFileName() {
		return fileName;
	}

	public void setFileName(String fileName) {
		this.fileName = fileName;
	}

	public int getRecordsCreated() {
		return recordsCreated;
	}

	public void setRecordsCreated(int recordsCreated) {
		this.recordsCreated = recordsCreated;
	}

	public int getRecordsUpdated() {
		return recordsUpdated;
	}

	public void setRecordsUpdated(int recordsUpdated) {
		this.recordsUpdated = recordsUpdated;
	}

	public int getRecordsIgnored() {
		return recordsIgnored;
	}

	public void setRecordsIgnored(int recordsIgnored) {
		this.recordsIgnored = recordsIgnored;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getUpdatedBy() {
		return updatedBy;
	}

	public void setUpdatedBy(String updatedBy) {
		this.updatedBy = updatedBy;
	}

	public LocalDateTime getUpdatedTime() {
		return updatedTime;
	}

	public void setUpdatedTime(LocalDateTime updatedTime) {
		this.updatedTime = updatedTime;
	}

	@Override
	public String toString() {
		return "LeadImportHistory [id=" + id + ", importDate=" + importDate + ", fileName=" + fileName
				+ ", recordsCreated=" + recordsCreated + ", recordsUpdated=" + recordsUpdated + ", recordsIgnored="
				+ recordsIgnored + ", status=" + status + ", updatedBy=" + updatedBy + ", updatedTime=" + updatedTime
				+ "]";
	}
	
	
}
