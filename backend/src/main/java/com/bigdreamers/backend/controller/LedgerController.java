package com.bigdreamers.backend.controller;

import com.bigdreamers.backend.dto.LedgerResponse;
import com.bigdreamers.backend.service.LedgerService;
import com.bigdreamers.backend.service.SessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class LedgerController {

    @Autowired
    private LedgerService ledgerService;

    @Autowired
    private SessionService sessionService;

    @GetMapping("/wholesaler/ledger")
    public ResponseEntity<?> getMyLedger(@RequestHeader(value = "Authorization", required = false) String token) {
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
            LedgerResponse ledger = ledgerService.getLedgerForUser(userId);
            return ResponseEntity.ok(ledger);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to generate ledger: " + e.getMessage()));
        }
    }

    @GetMapping("/admin/ledger/{wholesalerId}")
    public ResponseEntity<?> getWholesalerLedger(
            @RequestHeader(value = "Authorization", required = false) String token,
            @PathVariable Long wholesalerId) {
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
            LedgerResponse ledger = ledgerService.getLedgerForUser(wholesalerId);
            return ResponseEntity.ok(ledger);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to generate ledger: " + e.getMessage()));
        }
    }
}
