package com.platform.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "booking_provider_rejection",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_booking_provider_rejection", columnNames = {"booking_id", "provider_id"})
        },
        indexes = {
                @Index(name = "idx_bpr_booking", columnList = "booking_id"),
                @Index(name = "idx_bpr_provider", columnList = "provider_id")
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingProviderRejection {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false)
    private User provider;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}

