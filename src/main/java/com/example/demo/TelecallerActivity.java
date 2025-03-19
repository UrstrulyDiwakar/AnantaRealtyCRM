package com.example.demo;

public class TelecallerActivity {
    private String telecallerId;
    private String date;
    private int numberOfCalls;
    private int totalDurationMinutes;

    // Constructor
    public TelecallerActivity(String telecallerId, String date, int numberOfCalls, int totalDurationMinutes) {
        this.telecallerId = telecallerId;
        this.date = date;
        this.numberOfCalls = numberOfCalls;
        this.totalDurationMinutes = totalDurationMinutes;
    }

    // Getters and Setters
    public String getTelecallerId() {
        return telecallerId;
    }

    public void setTelecallerId(String telecallerId) {
        this.telecallerId = telecallerId;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public int getNumberOfCalls() {
        return numberOfCalls;
    }

    public void setNumberOfCalls(int numberOfCalls) {
        this.numberOfCalls = numberOfCalls;
    }

    public int getTotalDurationMinutes() {
        return totalDurationMinutes;
    }

    public void setTotalDurationMinutes(int totalDurationMinutes) {
        this.totalDurationMinutes = totalDurationMinutes;
    }
}
