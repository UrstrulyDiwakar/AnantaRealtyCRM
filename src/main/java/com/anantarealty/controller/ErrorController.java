package com.anantarealty.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ErrorController {

    @GetMapping("/error")
    public String handleError() {
        return "Oops! Something went wrong. Page not found.";
    }
}
