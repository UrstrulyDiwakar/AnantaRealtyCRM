package com.anantarealty.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Entity
public class Lead {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long LeadId;
	private String leadOwner;
	private String contactName;
	@Column(name = "mobile_number", unique = true, nullable = false)
	private String mobileNumber;
	private String alternateNumber;
	@Column(name = "email_address")
	private String emailAddress;
	private String leadStage;
	private double expectedRevenue;
	private LocalDate expectedClosingDate;
	@Column(name = "next_follow_up_on", columnDefinition = "TIMESTAMP")
	private LocalDateTime nextFollowUpOn; // Correct for date+time
	private String nextFollowUpNotes;
	private String description;

	private String siteVisited;

	private String leadTitle;

	private String category;
	private String assignedManager;

	@Temporal(TemporalType.DATE)
	private LocalDate leadDate;

	@Email(message = "Please enter a valid email")
	@NotBlank(message = "Email is required")
	private String leadOwnerEmail;

	@OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
	@JoinColumn(name = "source_id", referencedColumnName = "sourceInfoId")
	private SourceInfo sourceInfo;

	@OneToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
	@JoinColumn(name = "won_info", referencedColumnName = "wonInfoId")
	private WonInfo wonInfo;

	@OneToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
	@JoinColumn(name = "lead_history_id", referencedColumnName = "leadHistoryId")
	private LeadHistory leadHistory;

	public Long getLeadId() {
		return LeadId;
	}

	public void setLeadId(Long leadId) {
		LeadId = leadId;
	}

	public String getLeadOwner() {
		return leadOwner;
	}

	public void setLeadOwner(String leadOwner) {
		this.leadOwner = leadOwner;
	}

	public String getContactName() {
		return contactName;
	}

	public void setContactName(String contactName) {
		this.contactName = contactName;
	}

	public String getMobileNumber() {
		return mobileNumber;
	}

	public void setMobileNumber(String mobileNumber) {
		this.mobileNumber = mobileNumber;
	}

	public String getAlternateNumber() {
		return alternateNumber;
	}

	public void setAlternateNumber(String alternateNumber) {
		this.alternateNumber = alternateNumber;
	}

	public String getEmailAddress() {
		return emailAddress;
	}

	public void setEmailAddress(String emailAddress) {
		this.emailAddress = emailAddress;
	}

	public String getLeadStage() {
		return leadStage;
	}

	public void setLeadStage(String leadStage) {
		this.leadStage = leadStage;
	}

	public double getExpectedRevenue() {
		return expectedRevenue;
	}

	public void setExpectedRevenue(double expectedRevenue) {
		this.expectedRevenue = expectedRevenue;
	}

	public LocalDate getExpectedClosingDate() {
		return expectedClosingDate;
	}

	public void setExpectedClosingDate(LocalDate expectedClosingDate) {
		this.expectedClosingDate = expectedClosingDate;
	}

	public LocalDateTime getNextFollowUpOn() {
		return nextFollowUpOn;
	}

	public void setNextFollowUpOn(LocalDateTime nextFollowUpOn) {
		this.nextFollowUpOn = nextFollowUpOn;
	}

	public String getNextFollowUpNotes() {
		return nextFollowUpNotes;
	}

	public void setNextFollowUpNotes(String nextFollowUpNotes) {
		this.nextFollowUpNotes = nextFollowUpNotes;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getSiteVisited() {
		return siteVisited;
	}

	public void setSiteVisited(String siteVisited) {
		this.siteVisited = siteVisited;
	}

	public String getLeadTitle() {
		return leadTitle;
	}

	public void setLeadTitle(String leadTitle) {
		this.leadTitle = leadTitle;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}

	public String getAssignedManager() {
		return assignedManager;
	}

	public void setAssignedManager(String assignedManager) {
		this.assignedManager = assignedManager;
	}

	public LocalDate getLeadDate() {
		return leadDate;
	}

	public void setLeadDate(LocalDate leadDate) {
		this.leadDate = leadDate;
	}

	public String getLeadOwnerEmail() {
		return leadOwnerEmail;
	}

	public void setLeadOwnerEmail(String leadOwnerEmail) {
		this.leadOwnerEmail = leadOwnerEmail;
	}

	public SourceInfo getSourceInfo() {
		return sourceInfo;
	}

	public void setSourceInfo(SourceInfo sourceInfo) {
		this.sourceInfo = sourceInfo;
	}

	public WonInfo getWonInfo() {
		return wonInfo;
	}

	public void setWonInfo(WonInfo wonInfo) {
		this.wonInfo = wonInfo;
	}

	public LeadHistory getLeadHistory() {
		return leadHistory;
	}

	public void setLeadHistory(LeadHistory leadHistory) {
		this.leadHistory = leadHistory;
	}

	@Override
	public String toString() {
		return "Lead [LeadId=" + LeadId + ", leadOwner=" + leadOwner + ", contactName=" + contactName
				+ ", mobileNumber=" + mobileNumber + ", alternateNumber=" + alternateNumber + ", emailAddress="
				+ emailAddress + ", leadStage=" + leadStage + ", expectedRevenue=" + expectedRevenue
				+ ", expectedClosingDate=" + expectedClosingDate + ", nextFollowUpOn=" + nextFollowUpOn
				+ ", nextFollowUpNotes=" + nextFollowUpNotes + ", description=" + description + ", siteVisited="
				+ siteVisited + ", leadTitle=" + leadTitle + ", category=" + category + ", assignedManager="
				+ assignedManager + ", leadDate=" + leadDate + ", leadOwnerEmail=" + leadOwnerEmail + ", sourceInfo="
				+ sourceInfo + ", wonInfo=" + wonInfo + ", leadHistory=" + leadHistory + "]";
	}

}
