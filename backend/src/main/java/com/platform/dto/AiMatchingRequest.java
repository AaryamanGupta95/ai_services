package com.platform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AiMatchingRequest {

    private CustomerData customer;
    private List<ProviderData> providers;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CustomerData {
        private String city;
        private Double latitude;
        private Double longitude;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ProviderData {
        private Long id;
        private String city;
        private Double latitude;
        private Double longitude;
        private Double rating;
        private Integer experience;
        private Boolean available;
    }
}
