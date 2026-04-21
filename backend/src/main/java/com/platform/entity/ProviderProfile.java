package com.platform.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "provider_profile")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProviderProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
    
    private Integer experienceYears;
    
    // Default 0 until ratings are collected
    private Double averageRating = 0.0;
    
    private Boolean verifiedStatus = false;
    
    private Integer completedBookings = 0;
    
    @Column(length = 500)
    private String bio;
}
