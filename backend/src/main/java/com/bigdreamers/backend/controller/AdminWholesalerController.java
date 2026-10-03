package com.bigdreamers.backend.controller;

import com.bigdreamers.backend.entity.Order;
import com.bigdreamers.backend.entity.Payment;
import com.bigdreamers.backend.entity.User;
import com.bigdreamers.backend.repository.OrderRepository;
import com.bigdreamers.backend.repository.PaymentRepository;
import com.bigdreamers.backend.repository.UserRepository;
import com.bigdreamers.backend.service.SessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/wholesalers")
@CrossOrigin(origins = "*")
public class AdminWholesalerController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private SessionService sessionService;

    @GetMapping
    public ResponseEntity<?> getWholesalers(
            @RequestHeader(value = "Authorization", required = false) String token) {
        if (token == null || token.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Session expired or missing authentication token."));
        }
        Long userId = sessionService.getUserIdFromToken(token);
        if (userId == null || !sessionService.isAdmin(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Forbidden. Admin privileges required."));
        }

        List<User> wholesalers = userRepository.findByRole("WHOLESALER");
        return ResponseEntity.ok(wholesalers);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getWholesaler(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String token) {
        if (token == null || token.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Session expired or missing authentication token."));
        }
        Long userId = sessionService.getUserIdFromToken(token);
        if (userId == null || !sessionService.isAdmin(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Forbidden. Admin privileges required."));
        }

        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteWholesaler(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String token) {
        if (token == null || token.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Session expired or missing authentication token."));
        }
        Long userId = sessionService.getUserIdFromToken(token);
        if (userId == null || !sessionService.isAdmin(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Forbidden. Admin privileges required."));
        }

        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Wholesaler not found with ID: " + id));
        }

        if ("ADMIN".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Admin accounts cannot be deleted."));
        }

        // Clean up payments
        List<Payment> payments = paymentRepository.findByUserId(id);
        if (payments != null && !payments.isEmpty()) {
            paymentRepository.deleteAll(payments);
        }

        // Clean up orders (order items are cascaded)
        List<Order> orders = orderRepository.findByUserId(id);
        if (orders != null && !orders.isEmpty()) {
            orderRepository.deleteAll(orders);
        }

        // Delete user (wholesaler profile is cascaded)
        userRepository.delete(user);

        return ResponseEntity.ok(Map.of("message", "Wholesaler deleted successfully."));
    }
}
