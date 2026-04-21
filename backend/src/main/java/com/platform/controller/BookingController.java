package com.platform.controller;

import com.platform.dto.BookingRequest;
import com.platform.dto.MessageResponse;
import com.platform.entity.Booking;
import com.platform.entity.BookingStatus;
import com.platform.entity.Role;
import com.platform.entity.User;
import com.platform.repository.BookingRepository;
import com.platform.security.UserDetailsImpl;
import com.platform.service.BookingService;
import com.platform.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    BookingService bookingService;

    @Autowired
    BookingRepository bookingRepository;

    @Autowired
    UserService userService;

    @PostMapping("/request")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> requestBooking(Authentication authentication, @RequestBody BookingRequest request) {
        User customer = userService.findById(((UserDetailsImpl) authentication.getPrincipal()).getId()).get();
        Booking booking = bookingService.createBooking(customer, request);
        return ResponseEntity.ok(booking);
    }

    @GetMapping("/my-bookings")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('PROVIDER')")
    public ResponseEntity<List<Booking>> getMyBookings(Authentication authentication) {
        User user = userService.findById(((UserDetailsImpl) authentication.getPrincipal()).getId()).get();
        if (user.getRole() == Role.CUSTOMER) {
            return ResponseEntity.ok(bookingRepository.findByCustomerOrderByCreatedAtDesc(user));
        } else {
            return ResponseEntity.ok(bookingRepository.findByProviderOrderByCreatedAtDesc(user));
        }
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('PROVIDER') or hasRole('CUSTOMER')")
    public ResponseEntity<?> updateStatus(Authentication authentication, @PathVariable Long id, @RequestParam BookingStatus status) {
        User user = userService.findById(((UserDetailsImpl) authentication.getPrincipal()).getId()).get();
        try {
            Booking updatedBooking = bookingService.updateStatus(id, status, user);
            return ResponseEntity.ok(updatedBooking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}
