package com.bigdreamers.backend.controller;

import com.bigdreamers.backend.dto.AdminDashboardDto;
import com.bigdreamers.backend.service.AdminDashboardService;
import com.bigdreamers.backend.service.SessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/dashboard")
@CrossOrigin(origins = "*")
public class AdminDashboardController {

    @Autowired
    private AdminDashboardService adminDashboardService;

    @Autowired
    private SessionService sessionService;

    @GetMapping
    public ResponseEntity<?> getDashboardData(
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestParam(value = "lowStockThreshold", required = false, defaultValue = "10") Integer lowStockThreshold) {
        
        if (token == null || token.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Session expired or missing authentication token. Please log in again."));
        }

        Long userId = sessionService.getUserIdFromToken(token);
        if (userId == null || !sessionService.isAdmin(userId)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Unauthorized access. Admin privileges required."));
        }

        try {
            AdminDashboardDto dashboardData = adminDashboardService.getDashboardData(lowStockThreshold);
            return ResponseEntity.ok(dashboardData);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to load dashboard data: " + e.getMessage()));
        }
    }
}
