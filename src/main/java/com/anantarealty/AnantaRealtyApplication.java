package com.anantarealty;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;


@SpringBootApplication(scanBasePackages = "com.anantarealty")
public class AnantaRealtyApplication {
    public static void main(String[] args) {
        SpringApplication.run(AnantaRealtyApplication.class, args);
    }
}
