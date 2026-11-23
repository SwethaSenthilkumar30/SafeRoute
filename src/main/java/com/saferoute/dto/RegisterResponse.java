package com.saferoute.dto;

import java.time.LocalDateTime;

public class RegisterResponse {

    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private LocalDateTime createdAt;

    public RegisterResponse(Long id, String fullName, String email,
                            String phone, LocalDateTime createdAt) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}