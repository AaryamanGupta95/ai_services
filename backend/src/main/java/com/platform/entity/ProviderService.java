package com.platform.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "provider_service",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_provider_service", columnNames = {"provider_id", "service_id"})
        },
        indexes = {
                @Index(name = "idx_provider_service_provider", columnList = "provider_id"),
                @Index(name = "idx_provider_service_service", columnList = "service_id")
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProviderService {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false)
    private User provider;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    private ServiceInfo service;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}

