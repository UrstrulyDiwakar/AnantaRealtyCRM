package com.anantarealty.config;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

//    @Override
//    public void addCorsMappings(CorsRegistry registry) {
//        registry.addMapping("/api/**")
//                .allowedOrigins("http://localhost:8085") // Allows all origins
//                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")  // Allow these HTTP methods
//                .allowedHeaders("*");  // Allow all headers
//    }
}
