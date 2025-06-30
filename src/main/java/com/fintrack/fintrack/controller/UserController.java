package com.fintrack.fintrack.controller;

import com.fintrack.fintrack.dto.UserResponse;
import com.fintrack.fintrack.model.User;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @GetMapping("/me")
    public UserResponse getCurrentUser(@AuthenticationPrincipal User user) {
        return new UserResponse(user.getId(), user.getUsername(), user.getRole());
    }
}
