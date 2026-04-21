package com.platform.dto;

import lombok.Data;

@Data
public class BookingRequest {
    private Long serviceId;
    private Long providerId; // optional: customer can choose a specific provider
    private String scheduledTime; // ISO-8601 string, e.g., "2024-05-15T14:30:00"
    private String customerNotes;
}
