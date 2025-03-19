package com.anantarealty.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;

import com.anantarealty.service.UserDetailsServiceImpl;

@Configuration
public class SecurityConfig {

    private final UserDetailsServiceImpl userDetailsService;

    @Autowired
    public SecurityConfig(UserDetailsServiceImpl userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public static PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(request -> {
                CorsConfiguration config = new CorsConfiguration();
                config.setAllowedOrigins(List.of("http://localhost:8085"));
                config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                config.setAllowedHeaders(List.of("*"));
                return config;
            }))
            .csrf().disable()
            .headers(headers -> headers
                .frameOptions(frameOptions -> frameOptions.sameOrigin())
            )
            .authenticationProvider(authenticationProvider()) // Explicitly set the AuthenticationProvider
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/login.html", "/adduser.html", "/css/**", "/js/**", "/image/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/saveUser").permitAll()
                .requestMatchers("/api/**").permitAll()
                .requestMatchers("/api/getUsers").permitAll()
                .requestMatchers("/api/adduser").permitAll()
                .requestMatchers("/api/organization").permitAll()
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .requestMatchers("/manager/**").hasRole("MANAGER")
                .requestMatchers("/employee/**").hasRole("EMPLOYEE")
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage("/login.html")
                .loginProcessingUrl("/perform_login")
                .defaultSuccessUrl("/home.html", true)
                .failureUrl("/login.html?error=true")
                .permitAll()
            )
            .logout(logout -> logout
                .logoutUrl("/perform_logout")
                .logoutSuccessUrl("/login.html")
                .permitAll()
            );

        return http.build();
    }
}