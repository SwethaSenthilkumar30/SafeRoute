
package com.saferoute.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.saferoute.dto.LoginRequest;
import com.saferoute.dto.RegisterRequest;
import com.saferoute.dto.RegisterResponse;
import com.saferoute.dto.ProfileUpdateRequest;
import com.saferoute.entity.User;
import com.saferoute.service.UserService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public RegisterResponse register(@RequestBody RegisterRequest request) {

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(request.getPassword());

        User savedUser = userService.registerUser(user);

        return new RegisterResponse(
                savedUser.getId(),
                savedUser.getFullName(),
                savedUser.getEmail(),
                savedUser.getPhone(),
                savedUser.getCreatedAt()
        );
    }

    @PostMapping("/login")
    public RegisterResponse login(@RequestBody LoginRequest request) {

        User user = userService.loginUser(
                request.getEmail(),
                request.getPassword()
        );

        return new RegisterResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getCreatedAt()
        );
    }

    // Update Profile API
    @PutMapping("/profile/{id}")
    public RegisterResponse updateProfile(
            @PathVariable Long id,
            @RequestBody ProfileUpdateRequest request) {

        User updatedUser = userService.updateProfile(
                id,
                request.getFullName(),
                request.getPhone()
        );

        return new RegisterResponse(
                updatedUser.getId(),
                updatedUser.getFullName(),
                updatedUser.getEmail(),
                updatedUser.getPhone(),
                updatedUser.getCreatedAt()
        );
    }
}
