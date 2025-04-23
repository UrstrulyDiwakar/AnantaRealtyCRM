package com.anantarealty.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "call_record_data")
public class CallRecordDataEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotBlank
    @Column(name = "caller_name", length = 100)
    private String callerName;

    @NotNull
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Column(name = "start_time")
    private LocalDateTime startTime;

    @NotBlank
    @Column(name = "contact_name", length = 100)
    private String contactName;

    @NotNull
    @Column(name = "contact_phone_number", unique = true)
    private Long contactPhoneNumber;

    @NotBlank
    @Column(name = "call_type", length = 20)
    private String callType;

    @NotNull
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm:ss")
    @Column(name = "call_duration")
    private LocalTime callDuration;

    @Column(name = "feedback", length = 500)
    private String feedback;

    @Column(name = "notes", length = 1000)
    private String notes;

    // Constructors
    public CallRecordDataEntity() {
    }

    public CallRecordDataEntity(UUID id, String callerName, LocalDateTime startTime, String contactName,
                                Long contactPhoneNumber, String callType, LocalTime callDuration,
                                String feedback, String notes) {
        this.id = id;
        this.callerName = callerName;
        this.startTime = startTime;
        this.contactName = contactName;
        this.contactPhoneNumber = contactPhoneNumber;
        this.callType = callType;
        this.callDuration = callDuration;
        this.feedback = feedback;
        this.notes = notes;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getCallerName() {
        return callerName;
    }

    public void setCallerName(String callerName) {
        this.callerName = callerName;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public String getContactName() {
        return contactName;
    }

    public void setContactName(String contactName) {
        this.contactName = contactName;
    }

    public Long getContactPhoneNumber() {
        return contactPhoneNumber;
    }

    public void setContactPhoneNumber(Long contactPhoneNumber) {
        this.contactPhoneNumber = contactPhoneNumber;
    }

    public String getCallType() {
        return callType;
    }

    public void setCallType(String callType) {
        this.callType = callType;
    }

    public LocalTime getCallDuration() {
        return callDuration;
    }

    public void setCallDuration(LocalTime callDuration) {
        this.callDuration = callDuration;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    // toString() method
    @Override
    public String toString() {
        return "CallRecordDataEntity{" +
                "id=" + id +
                ", callerName='" + callerName + '\'' +
                ", startTime=" + startTime +
                ", contactName='" + contactName + '\'' +
                ", contactPhoneNumber=" + contactPhoneNumber +
                ", callType='" + callType + '\'' +
                ", callDuration=" + callDuration +
                ", feedback='" + feedback + '\'' +
                ", notes='" + notes + '\'' +
                '}';
    }
}


