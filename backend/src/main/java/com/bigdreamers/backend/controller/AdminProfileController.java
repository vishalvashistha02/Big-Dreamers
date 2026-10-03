package com.bigdreamers.backend.controller;

import com.bigdreamers.backend.dto.WholesalerProfileDto;
import com.bigdreamers.backend.service.ProfileService;
import com.bigdreamers.backend.service.SessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/profile")
@CrossOrigin(origins = "*")
public class AdminProfileController {

    @Autowired
    private ProfileService profileService;

    @Autowired
    private SessionService sessionService;

    @GetMapping
    public ResponseEntity<?> getAdminProfile(@RequestHeader(value = "Authorization", required = false) String token) {
        if (token == null || token.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Session expired or missing authentication token. Please log in again."));
        }

        Long adminId = sessionService.getUserIdFromToken(token);
        if (adminId == null || !sessionService.isAdmin(adminId)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Unauthorized access. Admin privileges required."));
        }

        try {
            WholesalerProfileDto adminProfile = profileService.getAdminProfile(adminId);
            return ResponseEntity.ok(adminProfile);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        }
    }
}
