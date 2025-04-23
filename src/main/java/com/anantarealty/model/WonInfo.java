package com.anantarealty.model;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;

@Entity
public class WonInfo {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long wonInfoId;
	@Temporal(TemporalType.DATE)
	private LocalDate dealDate;
	private double dealPrice;
	private long dealNoOfCents;
	private long dealTotalValue;
	private String dealDescription;
	
	
	
	//getters and setters
	public Long getWonInfoId() {
		return wonInfoId;
	}
	public void setWonInfoId(Long wonInfoId) {
		this.wonInfoId = wonInfoId;
	}
	public LocalDate getDealDate() {
		return dealDate;
	}
	public void setDealDate(LocalDate dealDate) {
		this.dealDate = dealDate;
	}
	public double getDealPrice() {
		return dealPrice;
	}
	public void setDealPrice(double dealPrice) {
		this.dealPrice = dealPrice;
	}
	public long getDealNoOfCents() {
		return dealNoOfCents;
	}
	public void setDealNoOfCents(long dealNoOfCents) {
		this.dealNoOfCents = dealNoOfCents;
	}
	public long getDealTotalValue() {
		return dealTotalValue;
	}
	public void setDealTotalValue(long dealTotalValue) {
		this.dealTotalValue = dealTotalValue;
	}
	public String getDealDescription() {
		return dealDescription;
	}
	public void setDealDescription(String dealDescription) {
		this.dealDescription = dealDescription;
	}
	@Override
	public String toString() {
		return "WonInfo [wonInfoId=" + wonInfoId + ", dealDate=" + dealDate + ", dealPrice=" + dealPrice
				+ ", dealNoOfCents=" + dealNoOfCents + ", dealTotalValue=" + dealTotalValue + ", dealDescription="
				+ dealDescription + "]";
	}
	
	

}
