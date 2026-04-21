package com.platform.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SignupRequest {
    @NotBlank
    private String name;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String password;

    @NotBlank
    private String role; // "CUSTOMER" or "PROVIDER"

    @NotBlank
    private String city;

    private String phone;
    
    // Optional
    private Double latitude;
    private Double longitude;
}
