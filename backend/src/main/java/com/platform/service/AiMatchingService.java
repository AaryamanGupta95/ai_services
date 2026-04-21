package com.platform.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.platform.dto.AiMatchingRequest;
import com.platform.dto.AiMatchingResponse;
import com.platform.entity.AiRecommendationLog;
import com.platform.entity.Booking;
import com.platform.entity.ProviderProfile;
import com.platform.entity.User;
import com.platform.repository.AiRecommendationLogRepository;
import com.platform.repository.ProviderProfileRepository;
import com.platform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Service
public class AiMatchingService {

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProviderProfileRepository profileRepository;

    @Autowired
    private AiRecommendationLogRepository logRepository;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AiMatchingResponse findBestProvider(Booking booking, List<User> availableProviders) {
        User customer = booking.getCustomer();

        // 1. Prepare Customer Data
        AiMatchingRequest.CustomerData customerData = AiMatchingRequest.CustomerData.builder()
                .city(customer.getCity())
                .latitude(customer.getLatitude())
                .longitude(customer.getLongitude())
                .build();

        // 2. Prepare Providers Data
        List<AiMatchingRequest.ProviderData> providerDataList = new ArrayList<>();
        for (User p : availableProviders) {
            ProviderProfile profile = profileRepository.findByUser(p).orElse(new ProviderProfile());

            providerDataList.add(AiMatchingRequest.ProviderData.builder()
                    .id(p.getId())
                    .city(p.getCity())
                    .latitude(p.getLatitude())
                    .longitude(p.getLongitude())
                    .rating(profile.getAverageRating())
                    .experience(profile.getExperienceYears() != null ? profile.getExperienceYears() : 0)
                    .available(true) // They are inherently available since filtered earlier
                    .build());
        }

        // 3. Create Request payload
        AiMatchingRequest requestPayload = new AiMatchingRequest(customerData, providerDataList);

        try {
            // 4. Send HTTP POST to Flask API
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<AiMatchingRequest> requestEntity = new HttpEntity<>(requestPayload, headers);

            String rawResponse = restTemplate.postForObject(aiServiceUrl, requestEntity, String.class);
            if (rawResponse == null || rawResponse.isBlank()) {
                throw new RuntimeException("Empty response from AI service");
            }
            AiMatchingResponse response = objectMapper.readValue(rawResponse, AiMatchingResponse.class);

            // 5. Log the recommendation
            if (response.getBest_provider_id() != null) {
                User assignedProvider = userRepository.findById(response.getBest_provider_id()).orElse(null);
                if (assignedProvider != null) {
                    AiRecommendationLog log = AiRecommendationLog.builder()
                            .booking(booking)
                            .assignedProvider(assignedProvider)
                            .aiScore(response.getScore())
                            .rawApiResponse(rawResponse)
                            .build();
                    logRepository.save(log);
                }
            }

            return response;
        } catch (Exception e) {
            System.err.println("Error calling AI Service: " + e.getMessage());
            e.printStackTrace();
            return new AiMatchingResponse(null, null, "AI Service failed: " + e.getMessage());
        }
    }
}
