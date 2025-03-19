package com.anantarealty.model;

import jakarta.persistence.Entity;


public class Filter {
    public String type;
    public String condition;
    public String value;

    public Filter(String type, String condition, String value) {
        this.type = type;
        this.condition = condition;
        this.value = value;
    }

    @Override
    public String toString() {
        return "Filter{" +
                "type='" + type + '\'' +
                ", condition='" + condition + '\'' +
                ", value='" + value + '\'' +
                '}';
    }
}
