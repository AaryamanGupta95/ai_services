package com.platform.controller;

import com.platform.dto.MessageResponse;
import com.platform.entity.Notification;
import com.platform.entity.User;
import com.platform.security.UserDetailsImpl;
import com.platform.repository.NotificationRepository;
import com.platform.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('PROVIDER') or hasRole('ADMIN')")
    public ResponseEntity<List<Notification>> myNotifications(Authentication authentication) {
        User user = userService.findById(((UserDetailsImpl) authentication.getPrincipal()).getId()).orElseThrow();
        return ResponseEntity.ok(notificationRepository.findByUserOrderByCreatedAtDesc(user));
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('PROVIDER') or hasRole('ADMIN')")
    public ResponseEntity<?> markRead(Authentication authentication, @PathVariable Long id) {
        User user = userService.findById(((UserDetailsImpl) authentication.getPrincipal()).getId()).orElseThrow();
        Notification n = notificationRepository.findById(id).orElse(null);
        if (n == null || !n.getUser().getId().equals(user.getId())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Notification not found"));
        }
        n.setIsRead(true);
        notificationRepository.save(n);
        return ResponseEntity.ok(new MessageResponse("Marked as read"));
    }
}

