package com.anantarealty.model;

import java.time.LocalDate;

import jakarta.annotation.Generated;
import jakarta.persistence.Column;
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
	private String compaignName;
	private String compaignTeam;
	private String compaignContent;
	private LocalDate leadDate;

	private String createdBy;

	public Long getId() {
		return sourceInfoId;
	}

	public void setId(Long id) {
		this.sourceInfoId = id;
	}

	public String getLeadSource() {
		return leadSource;
	}

	public void setLeadSource(String leadSource) {
		this.leadSource = leadSource;
	}

	public String getCompaignName() {
		return compaignName;
	}

	public void setCompaignName(String compaignName) {
		this.compaignName = compaignName;
	}

	public String getCompaignTeam() {
		return compaignTeam;
	}

	public void setCompaignTeam(String compaignTeam) {
		this.compaignTeam = compaignTeam;
	}

	public String getCompaignContent() {
		return compaignContent;
	}

	public void setCompaignContent(String compaignContent) {
		this.compaignContent = compaignContent;
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
		return "SourceInfo [sourceInfoId=" + sourceInfoId + ", leadSource=" + leadSource + ", compaignName="
				+ compaignName + ", compaignTeam=" + compaignTeam + ", compaignContent=" + compaignContent
				+ ", leadDate=" + leadDate + ", createdBy=" + createdBy + "]";
	}

}
