package com.bigdreamers.backend.controller;

import com.bigdreamers.backend.dto.PaymentRequest;
import com.bigdreamers.backend.entity.Payment;
import com.bigdreamers.backend.service.PaymentService;
import com.bigdreamers.backend.service.SessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private SessionService sessionService;

    @PostMapping("/api/payments")
    public ResponseEntity<?> makePayment(
            @RequestHeader("Authorization") String token,
            @RequestBody PaymentRequest request) {
        Long userId = sessionService.getUserIdFromToken(token);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }
        try {
            Payment payment = paymentService.processPayment(userId, request);
            return ResponseEntity.ok(payment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/api/payments")
    public ResponseEntity<?> getAllPayments(@RequestHeader("Authorization") String token) {
        Long userId = sessionService.getUserIdFromToken(token);
        if (userId == null || !sessionService.isAdmin(userId)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }
        List<Payment> payments = paymentService.getAllPayments();
        return ResponseEntity.ok(payments);
    }

    @GetMapping({"/api/payments/my-payments", "/api/wholesaler/payments"})
    public ResponseEntity<?> getMyPayments(@RequestHeader("Authorization") String token) {
        Long userId = sessionService.getUserIdFromToken(token);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }
        List<Payment> payments = paymentService.getPaymentsByUserId(userId);
        return ResponseEntity.ok(payments);
    }
}
