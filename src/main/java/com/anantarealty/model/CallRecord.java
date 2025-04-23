package com.anantarealty.model;


import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "call_records")
public class CallRecord {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long callRecordId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", referencedColumnName = "userid", nullable = false)
	private User user;

	@Enumerated(EnumType.STRING)
	@Column(name = "call_type", nullable = false)
	private CallType callType;

	@Column(name = "phone_number", nullable = false, length = 20)
	private String phoneNumber;

	@Column(name = "contact_name", length = 100)
	private String contactName;

	@Column(name = "start_time", nullable = false)
	private LocalDateTime startTime;

	@Column(name = "end_time")
	private LocalDateTime endTime;

	@Column(name = "duration_seconds")
	private Integer durationSeconds;

	@Column(name = "is_connected")
	private boolean connected = false;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private LocalDateTime createdAt;


	public Long getCallRecordId() {
		return callRecordId;
	}

	public void setCallRecordId(Long callRecordId) {
		this.callRecordId = callRecordId;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public CallType getCallType() {
		return callType;
	}

	public void setCallType(CallType callType) {
		this.callType = callType;
	}

	public String getPhoneNumber() {
		return phoneNumber;
	}

	public void setPhoneNumber(String phoneNumber) {
		this.phoneNumber = phoneNumber;
	}

	public String getContactName() {
		return contactName;
	}

	public void setContactName(String contactName) {
		this.contactName = contactName;
	}

	public LocalDateTime getStartTime() {
		return startTime;
	}

	public void setStartTime(LocalDateTime startTime) {
		this.startTime = startTime;
	}

	public LocalDateTime getEndTime() {
		return endTime;
	}

	public void setEndTime(LocalDateTime endTime) {
		this.endTime = endTime;
	}

	public Integer getDurationSeconds() {
		return durationSeconds;
	}

	public void setDurationSeconds(Integer durationSeconds) {
		this.durationSeconds = durationSeconds;
	}

	public boolean isConnected() {
		return connected;
	}

	public void setConnected(boolean connected) {
		this.connected = connected;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	
	
	@Override
	public String toString() {
		return "CallRecord [id=" + callRecordId + ", user=" + user + ", callType=" + callType + ", phoneNumber=" + phoneNumber
				+ ", contactName=" + contactName + ", startTime=" + startTime + ", endTime=" + endTime
				+ ", durationSeconds=" + durationSeconds + ", connected=" + connected + ", createdAt=" + createdAt
				+ "]";
	}

	// Helper method to calculate duration if not set
	public void calculateDuration() {
		if (startTime != null && endTime != null) {
			this.durationSeconds = (int) java.time.Duration.between(startTime, endTime).getSeconds();
		}
	}
}
