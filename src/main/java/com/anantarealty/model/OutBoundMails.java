package com.anantarealty.model;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;



@Entity
public class OutBoundMails {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long outBoundMailId;
	
	private String toAddress;
	private String ccAddress;
	private String bccAdress;
	
	private String subject;
	private String body;
	private String fromName;
	private String attachMentName;
	private String attachmentFormData;
	private TaskStatus status;
	private LocalDateTime date;
	
	private String reason;
	private String createdUserName;
	private LocalDateTime emailCreatedTime;
	private String updatedUserName;
	private LocalDateTime emailDeliveredTime;
	private String viewedUserName;
	private LocalDateTime viewdOnTime;
	
	private LocalDateTime modifiedTime;
	private LocalDateTime lastViewed;
	public Long getOutBoundMailId() {
		return outBoundMailId;
	}
	public void setOutBoundMailId(Long outBoundMailId) {
		this.outBoundMailId = outBoundMailId;
	}
	public String getToAddress() {
		return toAddress;
	}
	public void setToAddress(String toAddress) {
		this.toAddress = toAddress;
	}
	public String getCcAddress() {
		return ccAddress;
	}
	public void setCcAddress(String ccAddress) {
		this.ccAddress = ccAddress;
	}
	public String getBccAdress() {
		return bccAdress;
	}
	public void setBccAdress(String bccAdress) {
		this.bccAdress = bccAdress;
	}
	public String getSubject() {
		return subject;
	}
	public void setSubject(String subject) {
		this.subject = subject;
	}
	public String getBody() {
		return body;
	}
	public void setBody(String body) {
		this.body = body;
	}
	public String getFromName() {
		return fromName;
	}
	public void setFromName(String fromName) {
		this.fromName = fromName;
	}
	public String getAttachMentName() {
		return attachMentName;
	}
	public void setAttachMentName(String attachMentName) {
		this.attachMentName = attachMentName;
	}
	public String getAttachmentFormData() {
		return attachmentFormData;
	}
	public void setAttachmentFormData(String attachmentFormData) {
		this.attachmentFormData = attachmentFormData;
	}
	public TaskStatus getStatus() {
		return status;
	}
	public void setStatus(TaskStatus status) {
		this.status = status;
	}
	public LocalDateTime getDate() {
		return date;
	}
	public void setDate(LocalDateTime date) {
		this.date = date;
	}
	public String getReason() {
		return reason;
	}
	public void setReason(String reason) {
		this.reason = reason;
	}
	public String getCreatedUserName() {
		return createdUserName;
	}
	public void setCreatedUserName(String createdUserName) {
		this.createdUserName = createdUserName;
	}
	public LocalDateTime getEmailCreatedTime() {
		return emailCreatedTime;
	}
	public void setEmailCreatedTime(LocalDateTime emailCreatedTime) {
		this.emailCreatedTime = emailCreatedTime;
	}
	public String getUpdatedUserName() {
		return updatedUserName;
	}
	public void setUpdatedUserName(String updatedUserName) {
		this.updatedUserName = updatedUserName;
	}
	public LocalDateTime getEmailDeliveredTime() {
		return emailDeliveredTime;
	}
	public void setEmailDeliveredTime(LocalDateTime emailDeliveredTime) {
		this.emailDeliveredTime = emailDeliveredTime;
	}
	public String getViewedUserName() {
		return viewedUserName;
	}
	public void setViewedUserName(String viewedUserName) {
		this.viewedUserName = viewedUserName;
	}
	public LocalDateTime getViewdOnTime() {
		return viewdOnTime;
	}
	public void setViewdOnTime(LocalDateTime viewdOnTime) {
		this.viewdOnTime = viewdOnTime;
	}
	public LocalDateTime getModifiedTime() {
		return modifiedTime;
	}
	public void setModifiedTime(LocalDateTime modifiedTime) {
		this.modifiedTime = modifiedTime;
	}
	
	public LocalDateTime getLastViewed() {
		return lastViewed;
	}
	public void setLastViewed(LocalDateTime lastViewed) {
		this.lastViewed = lastViewed;
	}
	@Override
	public String toString() {
		return "OutBoutMails [outBoundMailId=" + outBoundMailId + ", toAddress=" + toAddress + ", ccAddress="
				+ ccAddress + ", bccAdress=" + bccAdress + ", subject=" + subject + ", body=" + body + ", fromName="
				+ fromName + ", attachMentName=" + attachMentName + ", attachmentFormData=" + attachmentFormData
				+ ", status=" + status + ", date=" + date + ", reason=" + reason + ", createdUserName="
				+ createdUserName + ", emailCreatedTime=" + emailCreatedTime + ", updatedUserName=" + updatedUserName
				+ ", emailDeliveredTime=" + emailDeliveredTime + ", viewedUserName=" + viewedUserName + ", viewdOnTime="
				+ viewdOnTime + ", modifiedTime=" + modifiedTime + ", lastViewd=" + lastViewed + "]";
	}
	
	
}
