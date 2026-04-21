package com.platform.controller;

import com.platform.dto.MessageResponse;
import com.platform.entity.Availability;
import com.platform.entity.ProviderProfile;
import com.platform.entity.User;
import com.platform.repository.AvailabilityRepository;
import com.platform.repository.ProviderProfileRepository;
import com.platform.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/provider")
public class ProviderController {

    @Autowired
    private ProviderProfileRepository profileRepository;

    @Autowired
    private AvailabilityRepository availabilityRepository;

    @Autowired
    private UserService userService;

    @GetMapping("/profile/{id}")
    @PreAuthorize("hasRole('PROVIDER') or hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<?> getProviderProfile(@PathVariable Long id) {
        Optional<ProviderProfile> profile = profileRepository.findByUserId(id);
        if (profile.isPresent()) {
            return ResponseEntity.ok(profile.get());
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/availability")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> addAvailability(Authentication authentication, @RequestBody Availability availability) {
        User provider = userService.findById(((com.platform.security.UserDetailsImpl) authentication.getPrincipal()).getId()).get();
        
        availability.setProvider(provider);
        availabilityRepository.save(availability);
        
        return ResponseEntity.ok(new MessageResponse("Availability added successfully!"));
    }

    @GetMapping("/availability")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<List<Availability>> getMyAvailabilities(Authentication authentication) {
        User provider = userService.findById(((com.platform.security.UserDetailsImpl) authentication.getPrincipal()).getId()).get();
        List<Availability> availabilities = availabilityRepository.findByProvider(provider);
        return ResponseEntity.ok(availabilities);
    }
}
