package com.platform.controller;

import com.platform.dto.MessageResponse;
import com.platform.dto.ProviderDetailsResponse;
import com.platform.entity.*;
import com.platform.repository.*;
import com.platform.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/services")
public class ServiceController {

    @Autowired
    private ServiceCategoryRepository categoryRepository;

    @Autowired
    private ServiceInfoRepository serviceInfoRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private ProviderServiceRepository providerServiceRepository;

    @Autowired
    private ProviderProfileRepository providerProfileRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @GetMapping("/categories")
    public ResponseEntity<List<ServiceCategory>> getAllCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    @PostMapping("/categories")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createCategory(@RequestBody ServiceCategory category) {
        if (categoryRepository.findByName(category.getName()).isPresent()) {
             return ResponseEntity.badRequest().body(new MessageResponse("Category already exists"));
        }
        categoryRepository.save(category);
        return ResponseEntity.ok(new MessageResponse("Category created successfully"));
    }

    @GetMapping
    public ResponseEntity<List<ServiceInfo>> getAllServices() {
        return ResponseEntity.ok(serviceInfoRepository.findAll());
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<ServiceInfo>> getServicesByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(serviceInfoRepository.findByCategoryId(categoryId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createService(@RequestBody ServiceInfo serviceInfo) {
        if (serviceInfo.getCategory() == null || serviceInfo.getCategory().getId() == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Category is required"));
        }
        serviceInfoRepository.save(serviceInfo);
        return ResponseEntity.ok(new MessageResponse("Service created successfully"));
    }

    @PostMapping("/{serviceId}/offer")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> offerService(Authentication authentication, @PathVariable Long serviceId) {
        User provider = userService.findById(((com.platform.security.UserDetailsImpl) authentication.getPrincipal()).getId()).get();
        if (provider.getRole() != Role.PROVIDER) {
            return ResponseEntity.badRequest().body(new MessageResponse("Only providers can offer services"));
        }
        ServiceInfo service = serviceInfoRepository.findById(serviceId).orElse(null);
        if (service == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Service not found"));
        }
        if (providerServiceRepository.existsByProviderAndService(provider, service)) {
            return ResponseEntity.ok(new MessageResponse("Service already offered"));
        }
        providerServiceRepository.save(com.platform.entity.ProviderService.builder()
                .provider(provider)
                .service(service)
                .build());
        return ResponseEntity.ok(new MessageResponse("Service added to your offerings"));
    }

    @GetMapping("/my-offerings")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> myOfferings(Authentication authentication) {
        User provider = userService.findById(((com.platform.security.UserDetailsImpl) authentication.getPrincipal()).getId()).get();
        return ResponseEntity.ok(providerServiceRepository.findByProvider(provider));
    }

    // --- NEW: Get all providers offering a specific service ---
    @GetMapping("/{serviceId}/providers")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<ProviderDetailsResponse>> getProvidersForService(@PathVariable Long serviceId) {
        ServiceInfo service = serviceInfoRepository.findById(serviceId).orElse(null);
        if (service == null) {
            return ResponseEntity.ok(new ArrayList<>());
        }

        List<ProviderService> offerings = providerServiceRepository.findByService(service);

        List<ProviderDetailsResponse> result = offerings.stream().map(ps -> {
            User provider = ps.getProvider();
            Optional<ProviderProfile> profileOpt = providerProfileRepository.findByUser(provider);
            ProviderProfile profile = profileOpt.orElse(null);

            List<Review> reviews = reviewRepository.findByProvider(provider);
            List<ProviderDetailsResponse.ReviewSummary> reviewSummaries = reviews.stream()
                    .map(r -> ProviderDetailsResponse.ReviewSummary.builder()
                            .rating(r.getRating())
                            .feedback(r.getFeedback())
                            .customerName(r.getCustomer() != null ? r.getCustomer().getName() : "Anonymous")
                            .createdAt(r.getCreatedAt() != null ? r.getCreatedAt().toString() : "")
                            .build())
                    .collect(Collectors.toList());

            return ProviderDetailsResponse.builder()
                    .userId(provider.getId())
                    .name(provider.getName())
                    .city(provider.getCity())
                    .averageRating(profile != null ? profile.getAverageRating() : 0.0)
                    .completedBookings(profile != null ? profile.getCompletedBookings() : 0)
                    .experienceYears(profile != null ? profile.getExperienceYears() : 0)
                    .verifiedStatus(profile != null ? profile.getVerifiedStatus() : false)
                    .bio(profile != null ? profile.getBio() : null)
                    .reviews(reviewSummaries)
                    .build();
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }
}

