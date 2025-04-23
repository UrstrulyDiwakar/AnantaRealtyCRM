package com.anantarealty.model;

import jakarta.persistence.*;
import java.time.Duration;
import java.time.LocalDate;

@Entity
@Table(name = "daily_call_summary")
public class DailyCallSummary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "userid", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDate callDate;

    private int dialedCalls;
    private int receivedCalls;
    private int missedCalls;

    private Long totalDuration;
    private Long longestCall;
    
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
	public int getDialedCalls() {
		return dialedCalls;
	}
	public void setDialedCalls(int dialedCalls) {
		this.dialedCalls = dialedCalls;
	}
	public int getReceivedCalls() {
		return receivedCalls;
	}
	public void setReceivedCalls(int receivedCalls) {
		this.receivedCalls = receivedCalls;
	}
	public int getMissedCalls() {
		return missedCalls;
	}
	public void setMissedCalls(int missedCalls) {
		this.missedCalls = missedCalls;
	}
	
	public Long getTotalDuration() {
		return totalDuration;
	}
	public void setTotalDuration(Long totalDuration) {
		this.totalDuration = totalDuration;
	}
	public Long getLongestCall() {
		return longestCall;
	}
	public void setLongestCall(Long longestCall) {
		this.longestCall = longestCall;
	}
	@Override
	public String toString() {
		return "DailyCallSummary [id=" + id + ", user=" + user + ", callDate=" + callDate + ", dialedCalls="
				+ dialedCalls + ", receivedCalls=" + receivedCalls + ", missedCalls=" + missedCalls + ", totalDuration="
				+ totalDuration + ", longestCall=" + longestCall + "]";
	}
    
    
}
