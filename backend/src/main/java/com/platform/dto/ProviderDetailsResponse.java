package com.platform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProviderDetailsResponse {
    private Long userId;
    private String name;
    private String city;
    private Double averageRating;
    private Integer completedBookings;
    private Integer experienceYears;
    private Boolean verifiedStatus;
    private String bio;
    private List<ReviewSummary> reviews;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReviewSummary {
        private Integer rating;
        private String feedback;
        private String customerName;
        private String createdAt;
    }
}
