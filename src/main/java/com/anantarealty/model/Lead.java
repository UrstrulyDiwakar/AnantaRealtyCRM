package com.anantarealty.model;

import java.util.Date;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;

@Entity
public class Lead {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long LeadId;
	private String leadOwner;
	private String contactName;
	private String mobile_number;
	private String alternateNumber;
	private String emailAddress;
	private String leadStage;
	private double expectedRevenue;
	@Temporal(TemporalType.DATE)
	private Date nextFollowUpOn;
	private String nextFollowUpNotes;
	private String description;
	
	private String siteVisited;

	@OneToOne(cascade = CascadeType.ALL)
	@JoinColumn(name = "source_id", referencedColumnName = "sourceInfoId")
	private SourceInfo sourceInfo;

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

	public String getMobile_number() {
		return mobile_number;
	}

	public void setMobile_number(String mobile_number) {
		this.mobile_number = mobile_number;
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

	

	public Date getNextFollowUpOn() {
		return nextFollowUpOn;
	}

	public void setNextFollowUpOn(Date nextFollowUpOn) {
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

	public SourceInfo getSourceInfo() {
		return sourceInfo;
	}

	public void setSourceInfo(SourceInfo sourceInfo) {
		this.sourceInfo = sourceInfo;
	}
	
	

	public String getSiteVisited() {
		return siteVisited;
	}

	public void setSiteVisited(String siteVisited) {
		this.siteVisited = siteVisited;
	}

	@Override
	public String toString() {
		return "Lead [LeadId=" + LeadId + ", leadOwner=" + leadOwner + ", contactName=" + contactName
				+ ", mobile_number=" + mobile_number + ", alternateNumber=" + alternateNumber + ", emailAddress="
				+ emailAddress + ", leadStage=" + leadStage + ", expectedRevenue=" + expectedRevenue
				+ ", nextFollowUpOn=" + nextFollowUpOn + ", nextFollowUpNotes=" + nextFollowUpNotes + ", description="
				+ description + ", sourceInfo=" + sourceInfo + "]";
	}

}
