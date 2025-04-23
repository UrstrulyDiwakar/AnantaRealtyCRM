package com.anantarealty.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

@Controller
@RequestMapping("/api/auth")
public class LoginController {

    // Method to return the custom login page
    @GetMapping("/login")
    public ModelAndView login() {
        return new ModelAndView("login");
    }

    // Add more methods if you have other custom pages or need to handle more requests,
    // For example, a custom success handler that directs users based on roles can be implemented here.
    
    // Example method to handle redirection after login based on roles or other conditions
    @GetMapping("/postLogin")
    public ModelAndView postLogin() {
        ModelAndView modelAndView = new ModelAndView();
        // logic to determine which page to redirect to 
        modelAndView.setViewName("redirect:/home.html");  // for example, redirecting to home
        return modelAndView;
    }
}
