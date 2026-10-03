package com.bigdreamers.backend.controller;

import com.bigdreamers.backend.dto.WholesalerDashboardDto;
import com.bigdreamers.backend.service.SessionService;
import com.bigdreamers.backend.service.WholesalerDashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/wholesaler/dashboard")
@CrossOrigin(origins = "*")
public class WholesalerDashboardController {

    @Autowired
    private WholesalerDashboardService wholesalerDashboardService;

    @Autowired
    private SessionService sessionService;

    @GetMapping
    public ResponseEntity<?> getDashboard(@RequestHeader(value = "Authorization", required = false) String token) {
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
            WholesalerDashboardDto data = wholesalerDashboardService.getDashboardForUser(userId);
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to load wholesaler dashboard: " + e.getMessage()));
        }
    }
}
