package com.fintrack.fintrack.controller;

import com.fintrack.fintrack.dto.AuthResponse;
import com.fintrack.fintrack.dto.LoginRequest;
import com.fintrack.fintrack.dto.RegisterRequest;
import com.fintrack.fintrack.service.AuthenticationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            // Fix: Null-safe string comparison
            if (e.getMessage() != null && e.getMessage().equals("Username already exists")) {
                return ResponseEntity.badRequest().body("Username already exists");
            }
            return ResponseEntity.internalServerError().body("Registration failed");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().equals("Invalid credentials")) {
                return ResponseEntity.badRequest().body("Invalid credentials");
            }
            return ResponseEntity.internalServerError().body("Login failed");
        }
    }
}