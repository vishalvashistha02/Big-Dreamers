package com.bigdreamers.backend.controller;

import com.bigdreamers.backend.dto.OrderRequest;
import com.bigdreamers.backend.entity.Order;
import com.bigdreamers.backend.service.OrderService;
import com.bigdreamers.backend.service.SessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private SessionService sessionService;

    @PostMapping("/api/orders")
    public ResponseEntity<?> placeOrder(@RequestHeader("Authorization") String token, @RequestBody OrderRequest request) {
        Long userId = sessionService.getUserIdFromToken(token);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }
        try {
            Order order = orderService.createOrder(userId, request);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/api/orders")
    public ResponseEntity<?> getAllOrders(@RequestHeader("Authorization") String token) {
        Long userId = sessionService.getUserIdFromToken(token);
        if (userId == null || !sessionService.isAdmin(userId)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }
        List<Order> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    @GetMapping({"/api/orders/my-orders", "/api/wholesaler/orders"})
    public ResponseEntity<?> getMyOrders(@RequestHeader("Authorization") String token) {
        Long userId = sessionService.getUserIdFromToken(token);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }
        List<Order> orders = orderService.getOrdersByUserId(userId);
        return ResponseEntity.ok(orders);
    }

    @PutMapping("/api/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @RequestHeader("Authorization") String token, 
            @PathVariable Long id, 
            @RequestBody Map<String, String> body) {
        Long userId = sessionService.getUserIdFromToken(token);
        if (userId == null || !sessionService.isAdmin(userId)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }
        String status = body.get("status");
        if (status == null || status.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Status is required"));
        }
        try {
            Order order = orderService.updateOrderStatus(id, status);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
