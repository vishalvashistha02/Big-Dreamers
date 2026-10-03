package com.bigdreamers.backend.controller;

import com.bigdreamers.backend.dto.*;
import com.bigdreamers.backend.entity.User;
import com.bigdreamers.backend.entity.WholesalerProfile;
import com.bigdreamers.backend.repository.UserRepository;
import com.bigdreamers.backend.repository.WholesalerProfileRepository;
import com.bigdreamers.backend.service.OtpService;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired private UserRepository userRepository;
    @Autowired private WholesalerProfileRepository profileRepository;
    @Autowired private OtpService otpService;
    @Autowired private com.bigdreamers.backend.service.SessionService sessionService;

    // ─────────────────────────────────────────────────────────────────────────
    //  ADMIN LOGIN  (Admin ID + Password)
    // ─────────────────────────────────────────────────────────────────────────

    @PostMapping("/login")
    public ResponseEntity<?> adminLogin(@RequestBody LoginRequest request) {
        String adminId = request.getAdminId();
        if (blank(adminId) || blank(request.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Admin ID and password are required."));
        }

        Optional<User> userOpt = userRepository.findByUsername(adminId.trim());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if ("ADMIN".equalsIgnoreCase(user.getRole()) && BCrypt.checkpw(request.getPassword(), user.getPassword())) {
                String token = sessionService.createSession(user.getId());
                return ResponseEntity.ok(buildSessionMap(user, token));
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Invalid Admin ID or password."));
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  WHOLESALER REGISTRATION — Step 1: validate & send OTP to mobile
    // ─────────────────────────────────────────────────────────────────────────

    @PostMapping("/wholesaler/pre-register")
    public ResponseEntity<?> preRegister(@RequestBody RegistrationRequest req) {
        // Validate required fields
        if (blank(req.getName()) || blank(req.getUsername()) || blank(req.getMobile())
                || blank(req.getPassword()) || blank(req.getShopName())) {
            return bad("All required fields must be filled.");
        }
        if (req.getMobile().length() != 10 || !req.getMobile().matches("\\d{10}")) {
            return bad("Please enter a valid 10-digit mobile number.");
        }
        if (req.getPassword().length() < 8) {
            return bad("Password must be at least 8 characters.");
        }
        if (!req.getPassword().equals(req.getConfirmPassword())) {
            return bad("Passwords do not match.");
        }

        // Duplicate checks
        if (userRepository.existsByUsername(req.getUsername())) {
            return bad("Username already exists. Please choose another username.");
        }
        if (userRepository.existsByMobile(req.getMobile())) {
            return bad("This mobile number is already registered. Please login instead.");
        }
        if (!blank(req.getEmail()) && userRepository.existsByEmail(req.getEmail())) {
            return bad("This email address is already registered.");
        }

        // Send OTP for mobile verification
        String devOtp;
        try {
            devOtp = otpService.generateAndSend(req.getMobile());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(Map.of("message", e.getMessage()));
        }

        String masked = "+91 XXXXX " + req.getMobile().substring(5);
        // ⚠️ devOtp is returned ONLY for development/testing. Remove before production.
        return ResponseEntity.ok(Map.of(
                "message", "OTP sent to registered mobile.",
                "sentTo", masked,
                "devOtp", devOtp
        ));
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  WHOLESALER REGISTRATION — Step 2: verify OTP then create account
    // ─────────────────────────────────────────────────────────────────────────

    @PostMapping("/wholesaler/register")
    public ResponseEntity<?> registerWholesaler(@RequestBody RegistrationRequest req) {
        if (blank(req.getOtp())) {
            return bad("OTP is required.");
        }

        // Verify OTP
        try {
            otpService.verify(req.getMobile(), req.getOtp());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        }

        // Final duplicate check (in case another request slipped through)
        if (userRepository.existsByUsername(req.getUsername())) {
            return bad("Username already exists.");
        }
        if (userRepository.existsByMobile(req.getMobile())) {
            return bad("Mobile number already registered.");
        }

        // Create User
        User user = new User();
        user.setName(req.getName());
        user.setUsername(req.getUsername().trim().toLowerCase());
        user.setMobile(req.getMobile().trim());
        user.setEmail(req.getEmail());
        user.setPassword(BCrypt.hashpw(req.getPassword(), BCrypt.gensalt()));
        user.setRole("WHOLESALER");
        user.setStatus("Active");

        // Create WholesalerProfile
        WholesalerProfile profile = new WholesalerProfile();
        profile.setShopName(req.getShopName());
        profile.setAddress(req.getAddress());
        profile.setCity(req.getCity());
        profile.setState(req.getState());
        profile.setPincode(req.getPincode());
        profile.setGstNumber(req.getGstNumber());
        profile.setUser(user);
        user.setWholesalerProfile(profile);

        userRepository.save(user);

        Map<String, Object> resp = new HashMap<>();
        resp.put("message", "Registration successful!");
        resp.put("username", user.getUsername());
        resp.put("name", user.getName());
        return ResponseEntity.ok(resp);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  WHOLESALER LOGIN — Username + Password (no OTP)
    // ─────────────────────────────────────────────────────────────────────────

    @PostMapping("/wholesaler/login")
    public ResponseEntity<?> wholesalerLogin(@RequestBody WholesalerLoginRequest req) {
        if (blank(req.getUsername()) || blank(req.getPassword())) {
            return bad("Username and password are required.");
        }

        Optional<User> userOpt = userRepository.findByUsername(req.getUsername().trim().toLowerCase());
        if (userOpt.isEmpty() || !"WHOLESALER".equals(userOpt.get().getRole())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid username or password."));
        }

        User user = userOpt.get();
        if (!BCrypt.checkpw(req.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid username or password."));
        }
        if (!"Active".equalsIgnoreCase(user.getStatus())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Your account is inactive. Please contact admin."));
        }

        String token = sessionService.createSession(user.getId());
        return ResponseEntity.ok(buildSessionMap(user, token));
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  FORGOT PASSWORD — Step 1: send OTP to mobile
    // ─────────────────────────────────────────────────────────────────────────

    @PostMapping("/wholesaler/forgot-password/send-otp")
    public ResponseEntity<?> forgotSendOtp(@RequestBody Map<String, String> body) {
        String identifier = body.get("identifier"); // username or mobile
        if (blank(identifier)) return bad("Please enter your username or mobile number.");

        // Find user by username or mobile
        Optional<User> userOpt = userRepository.findByUsernameOrMobile(
                identifier.trim().toLowerCase(), identifier.trim());
        if (userOpt.isEmpty() || !"WHOLESALER".equals(userOpt.get().getRole())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "No wholesaler account found with this username/mobile."));
        }

        User user = userOpt.get();
        String devOtp;
        try {
            devOtp = otpService.generateAndSend(user.getMobile());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(Map.of("message", e.getMessage()));
        }

        String masked = "+91 XXXXX " + user.getMobile().substring(5);
        // ⚠️ devOtp is for development only. Remove before production.
        return ResponseEntity.ok(Map.of(
                "message", "OTP sent to registered mobile.",
                "sentTo", masked,
                "mobile", user.getMobile(),
                "devOtp", devOtp
        ));
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  FORGOT PASSWORD — Step 2: verify OTP + set new password
    // ─────────────────────────────────────────────────────────────────────────

    @PostMapping("/wholesaler/forgot-password/reset")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest req) {
        if (blank(req.getMobile()) || blank(req.getOtp())) {
            return bad("Mobile and OTP are required.");
        }
        if (blank(req.getNewPassword()) || req.getNewPassword().length() < 8) {
            return bad("New password must be at least 8 characters.");
        }
        if (!req.getNewPassword().equals(req.getConfirmPassword())) {
            return bad("Passwords do not match.");
        }

        // Verify OTP
        try {
            otpService.verify(req.getMobile(), req.getOtp());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        }

        Optional<User> userOpt = userRepository.findByMobile(req.getMobile());
        if (userOpt.isEmpty()) return bad("User not found.");

        User user = userOpt.get();
        user.setPassword(BCrypt.hashpw(req.getNewPassword(), BCrypt.gensalt()));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Password reset successfully. Please login with your new password."));
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Helpers
    // ─────────────────────────────────────────────────────────────────────────

    private boolean blank(String s) { return s == null || s.isBlank(); }

    private ResponseEntity<?> bad(String msg) {
        return ResponseEntity.badRequest().body(Map.of("message", msg));
    }

    private Map<String, Object> buildSessionMap(User user, String token) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", user.getId());
        m.put("name", user.getName());
        m.put("username", user.getUsername());
        m.put("role", user.getRole().toLowerCase());
        m.put("mobile", user.getMobile());
        m.put("email", user.getEmail());
        m.put("status", user.getStatus());
        m.put("token", token);
        if (user.getWholesalerProfile() != null) {
            m.put("shopName", user.getWholesalerProfile().getShopName());
        }
        return m;
    }
}
