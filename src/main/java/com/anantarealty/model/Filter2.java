package com.anantarealty.model;

public class Filter2 {
    public String type1;
    public String condition1;
    public String value;
    public String type2;
    public String condition2;
    public String value2;

    public Filter2(String type1, String condition1, String value, String type2, String condition2, String value2) {
        this.type1 = type1;
        this.condition1 = condition1;
        this.value = value;
        this.type2 = type2;
        this.condition2 = condition2;
        this.value2 = value2;
    }

    @Override
    public String toString() {
        return "Filter2{" +
                "type1='" + type1 + '\'' +
                ", condition1='" + condition1 + '\'' +
                ", value='" + value + '\'' +
                ", type2='" + type2 + '\'' +
                ", condition2='" + condition2 + '\'' +
                ", value2='" + value2 + '\'' +
                '}';
    }
}
