package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.anantarealty")
@ComponentScan(basePackages = "com.anantarealty")
@EnableJpaRepositories(basePackages = "com.anantarealty.repository")
@EntityScan(basePackages = "com.anantarealty.model")
public class AnantaRealtyCRMApplication {

	public static void main(String[] args) {
		SpringApplication.run(AnantaRealtyCRMApplication.class, args);
	}

}

