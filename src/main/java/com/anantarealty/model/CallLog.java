package com.anantarealty.model;

import java.time.*;

import jakarta.persistence.*;

@Entity
@Table(name = "call_logs")
public class CallLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "userid", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDate callDate;

    @Column(nullable = false)
    private LocalDateTime callTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CallType callType;

    @Column
    private Long duration;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public LocalDate getCallDate() {
		return callDate;
	}

	public void setCallDate(LocalDate callDate) {
		this.callDate = callDate;
	}

	public LocalDateTime getCallTime() {
		return callTime;
	}

	public void setCallTime(LocalDateTime callTime) {
		this.callTime = callTime;
	}

	public CallType getCallType() {
		return callType;
	}

	public void setCallType(CallType callType) {
		this.callType = callType;
	}

	

	public Long getDuration() {
		return duration;
	}

	public void setDuration(Long duration) {
		this.duration = duration;
	}

	@Override
	public String toString() {
		return "CallLog [id=" + id + ", user=" + user + ", callDate=" + callDate + ", callTime=" + callTime
				+ ", callType=" + callType + ", duration=" + duration + "]";
	}
    
    
}
