package com.anantarealty.model;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class SourceInfo {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long sourceInfoId;
	private String leadSource;
	private String campaignName;
	private String campaignTeam;
	private String campaignContent;
	private LocalDate leadDate;

	private String createdBy;

	public Long getSourceInfoId() {
		return sourceInfoId;
	}

	public void setSourceInfoId(Long sourceInfoId) {
		this.sourceInfoId = sourceInfoId;
	}

	public String getLeadSource() {
		return leadSource;
	}

	public void setLeadSource(String leadSource) {
		this.leadSource = leadSource;
	}

	public String getCampaignName() {
		return campaignName;
	}

	public void setCampaignName(String campaignName) {
		this.campaignName = campaignName;
	}

	public String getCampaignTeam() {
		return campaignTeam;
	}

	public void setCampaignTeam(String campaignTeam) {
		this.campaignTeam = campaignTeam;
	}

	public String getCampaignContent() {
		return campaignContent;
	}

	public void setCampaignContent(String campaignContent) {
		this.campaignContent = campaignContent;
	}

	public LocalDate getLeadDate() {
		return leadDate;
	}

	public void setLeadDate(LocalDate leadDate) {
		this.leadDate = leadDate;
	}

	public String getCreatedBy() {
		return createdBy;
	}

	public void setCreatedBy(String createdBy) {
		this.createdBy = createdBy;
	}

	@Override
	public String toString() {
		return "SourceInfo [sourceInfoId=" + sourceInfoId + ", leadSource=" + leadSource + ", campaignName="
				+ campaignName + ", campaignTeam=" + campaignTeam + ", campaignContent=" + campaignContent
				+ ", leadDate=" + leadDate + ", createdBy=" + createdBy + "]";
	}

	

}
