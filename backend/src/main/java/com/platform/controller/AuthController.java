package com.platform.controller;

import com.platform.dto.JwtResponse;
import com.platform.dto.LoginRequest;
import com.platform.dto.MessageResponse;
import com.platform.dto.SignupRequest;
import com.platform.entity.ProviderProfile;
import com.platform.entity.Role;
import com.platform.entity.User;
import com.platform.repository.ProviderProfileRepository;
import com.platform.security.JwtUtils;
import com.platform.security.UserDetailsImpl;
import com.platform.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserService userService;

    @Autowired
    ProviderProfileRepository providerProfileRepository;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String role = userDetails.getAuthorities().iterator().next().getAuthority();

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                role));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userService.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        Role userRole;
        try {
            userRole = Role.valueOf(signUpRequest.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Invalid role specified."));
        }

        // Create new user's account
        User user = userService.createUser(
                signUpRequest.getName(),
                signUpRequest.getEmail(),
                signUpRequest.getPassword(),
                userRole,
                signUpRequest.getCity(),
                signUpRequest.getPhone(),
                signUpRequest.getLatitude(),
                signUpRequest.getLongitude()
        );

        if (userRole == Role.PROVIDER) {
            // Initialize provider profile
            ProviderProfile profile = ProviderProfile.builder()
                    .user(user)
                    .experienceYears(0)
                    .averageRating(0.0)
                    .verifiedStatus(false)
                    .completedBookings(0)
                    .build();
            providerProfileRepository.save(profile);
        }

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }
}
