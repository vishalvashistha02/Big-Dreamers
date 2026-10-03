package com.bigdreamers.backend.controller;

import com.bigdreamers.backend.dto.ChangePasswordRequest;
import com.bigdreamers.backend.dto.ProfileUpdateRequest;
import com.bigdreamers.backend.dto.WholesalerProfileDto;
import com.bigdreamers.backend.service.ProfileService;
import com.bigdreamers.backend.service.SessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class WholesalerProfileController {

    @Autowired
    private ProfileService profileService;

    @Autowired
    private SessionService sessionService;

    @GetMapping({"/api/wholesaler/profile", "/api/wholesalers/profile"})
    public ResponseEntity<?> getProfile(@RequestHeader(value = "Authorization", required = false) String token) {
        if (token == null || token.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Session expired or missing authentication token. Please log in again."));
        }

        Long userId = sessionService.getUserIdFromToken(token);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Session expired or invalid. Please log in again."));
        }

        try {
            WholesalerProfileDto profile = profileService.getWholesalerProfile(userId);
            return ResponseEntity.ok(profile);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping({"/api/wholesaler/profile", "/api/wholesalers/profile"})
    public ResponseEntity<?> updateProfile(
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestBody ProfileUpdateRequest req) {
        
        if (token == null || token.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Session expired or missing authentication token. Please log in again."));
        }

        Long userId = sessionService.getUserIdFromToken(token);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Session expired or invalid. Please log in again."));
        }

        try {
            WholesalerProfileDto updated = profileService.updateWholesalerProfile(userId, req);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @RequestMapping(value = {"/api/wholesaler/change-password", "/api/wholesalers/change-password"}, method = {RequestMethod.PUT, RequestMethod.POST})
    public ResponseEntity<?> changePassword(
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestBody ChangePasswordRequest req) {
        
        if (token == null || token.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Session expired or missing authentication token. Please log in again."));
        }

        Long userId = sessionService.getUserIdFromToken(token);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Session expired or invalid. Please log in again."));
        }

        try {
            profileService.changePassword(userId, req);
            return ResponseEntity.ok(Map.of("message", "Password changed successfully. Please keep your new password secure."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
