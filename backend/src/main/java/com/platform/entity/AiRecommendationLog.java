package com.platform.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "ai_recommendation_log")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiRecommendationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_provider_id", nullable = false)
    private User assignedProvider;

    @Column(nullable = false)
    private Double aiScore;

    @Column(length = 2000)
    private String rawApiResponse;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
