package com.platform.controller;

import com.platform.dto.MessageResponse;
import com.platform.entity.ProviderProfile;
import com.platform.entity.ServiceCategory;
import com.platform.entity.User;
import com.platform.repository.ProviderProfileRepository;
import com.platform.repository.ServiceCategoryRepository;
import com.platform.repository.UserRepository;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private ProviderProfileRepository profileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ServiceCategoryRepository categoryRepository;

    @GetMapping("/providers")
    public ResponseEntity<List<ProviderProfile>> allProviders() {
        return ResponseEntity.ok(profileRepository.findAll());
    }

    @PutMapping("/providers/{userId}/verify")
    public ResponseEntity<?> verifyProvider(@PathVariable Long userId, @RequestParam boolean verified) {
        ProviderProfile profile = profileRepository.findByUserId(userId).orElse(null);
        if (profile == null) return ResponseEntity.badRequest().body(new MessageResponse("Provider profile not found"));
        profile.setVerifiedStatus(verified);
        profileRepository.save(profile);
        return ResponseEntity.ok(new MessageResponse("Provider verification updated"));
    }

    @PostMapping("/categories")
    public ResponseEntity<?> createCategory(@RequestBody ServiceCategory category) {
        if (category.getName() == null || category.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Name is required"));
        }
        if (categoryRepository.findByName(category.getName()).isPresent()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Category already exists"));
        }
        categoryRepository.save(category);
        return ResponseEntity.ok(new MessageResponse("Category created"));
    }
}

