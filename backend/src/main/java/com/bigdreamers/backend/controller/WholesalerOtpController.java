package com.bigdreamers.backend.controller;

import com.bigdreamers.backend.dto.SendOtpRequest;
import com.bigdreamers.backend.dto.VerifyOtpRequest;
import com.bigdreamers.backend.entity.User;
import com.bigdreamers.backend.repository.UserRepository;
import com.bigdreamers.backend.service.OtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth/wholesaler")
@CrossOrigin(origins = "*")
public class WholesalerOtpController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OtpService otpService;

    /**
     * Step 1 — Validate wholesaler identity (name + mobile + shopName), then send OTP.
     */
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody SendOtpRequest req) {
        if (req.getName() == null || req.getMobile() == null || req.getShopName() == null ||
            req.getName().isBlank() || req.getMobile().isBlank() || req.getShopName().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Name, Mobile, and Shop Name are required."));
        }

        Optional<User> userOpt = userRepository.findByMobile(req.getMobile());

        if (userOpt.isEmpty() || !"WHOLESALER".equals(userOpt.get().getRole())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "No wholesaler account found with this mobile number."));
        }

        User user = userOpt.get();

        // Case-insensitive trim match for Name
        if (!user.getName().trim().equalsIgnoreCase(req.getName().trim())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Wholesaler details do not match our records."));
        }

        // Case-insensitive trim match for Shop Name
        String registeredShop = user.getWholesalerProfile() != null
                ? user.getWholesalerProfile().getShopName() : "";
        if (!registeredShop.trim().equalsIgnoreCase(req.getShopName().trim())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Wholesaler details do not match our records."));
        }

        try {
            otpService.generateAndSend(req.getMobile());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("message", e.getMessage()));
        }

        // Mask the mobile for the response (show only last 5 digits)
        String masked = "+91 XXXXX " + req.getMobile().substring(Math.max(0, req.getMobile().length() - 5));

        return ResponseEntity.ok(Map.of(
                "message", "OTP sent successfully.",
                "sentTo", masked
        ));
    }

    /**
     * Step 2 — Verify OTP and return session data.
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody VerifyOtpRequest req) {
        if (req.getMobile() == null || req.getOtp() == null ||
            req.getMobile().isBlank() || req.getOtp().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Mobile and OTP are required."));
        }

        try {
            otpService.verify(req.getMobile(), req.getOtp());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", e.getMessage()));
        }

        Optional<User> userOpt = userRepository.findByMobile(req.getMobile());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found."));
        }

        User user = userOpt.get();
        Map<String, Object> response = new HashMap<>();
        response.put("id",       user.getId());
        response.put("name",     user.getName());
        response.put("role",     user.getRole().toLowerCase());
        response.put("mobile",   user.getMobile());
        response.put("email",    user.getEmail());
        if (user.getWholesalerProfile() != null) {
            response.put("shopName", user.getWholesalerProfile().getShopName());
        }

        return ResponseEntity.ok(response);
    }
}
