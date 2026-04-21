package com.platform.controller;

import com.platform.dto.MessageResponse;
import com.platform.dto.ReviewCreateRequest;
import com.platform.entity.Review;
import com.platform.entity.Role;
import com.platform.entity.User;
import com.platform.security.UserDetailsImpl;
import com.platform.service.ReviewService;
import com.platform.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private UserService userService;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> create(Authentication authentication, @Valid @RequestBody ReviewCreateRequest request) {
        User customer = userService.findById(((UserDetailsImpl) authentication.getPrincipal()).getId()).orElseThrow();
        try {
            return ResponseEntity.ok(reviewService.createReview(customer, request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<List<Review>> myReviews(Authentication authentication) {
        User provider = userService.findById(((UserDetailsImpl) authentication.getPrincipal()).getId()).orElseThrow();
        return ResponseEntity.ok(reviewService.getProviderReviews(provider));
    }
}

