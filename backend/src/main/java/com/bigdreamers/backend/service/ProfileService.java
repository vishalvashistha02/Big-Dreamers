package com.bigdreamers.backend.service;

import com.bigdreamers.backend.dto.ChangePasswordRequest;
import com.bigdreamers.backend.dto.ProfileUpdateRequest;
import com.bigdreamers.backend.dto.WholesalerProfileDto;
import com.bigdreamers.backend.entity.User;
import com.bigdreamers.backend.entity.WholesalerProfile;
import com.bigdreamers.backend.repository.UserRepository;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.regex.Pattern;

@Service
public class ProfileService {

    @Autowired
    private UserRepository userRepository;

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$");
    private static final Pattern PINCODE_PATTERN = Pattern.compile("^[1-9][0-9]{5}$");

    public WholesalerProfileDto getWholesalerProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User profile not found"));
        return mapToDto(user);
    }

    public WholesalerProfileDto updateWholesalerProfile(Long userId, ProfileUpdateRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User profile not found"));

        if (req.getName() == null || req.getName().trim().isEmpty()) {
            throw new RuntimeException("Full Name is required.");
        }
        if (req.getShopName() == null || req.getShopName().trim().isEmpty()) {
            throw new RuntimeException("Shop / Business Name is required.");
        }

        // Email validation
        if (req.getEmail() != null && !req.getEmail().trim().isEmpty()) {
            String email = req.getEmail().trim();
            if (!EMAIL_PATTERN.matcher(email).matches()) {
                throw new RuntimeException("Invalid email format.");
            }
            Optional<User> existingWithEmail = userRepository.findByEmail(email);
            if (existingWithEmail.isPresent() && !existingWithEmail.get().getId().equals(userId)) {
                throw new RuntimeException("Email address is already in use by another account.");
            }
            user.setEmail(email);
        } else {
            user.setEmail(null);
        }

        user.setName(req.getName().trim());

        WholesalerProfile profile = user.getWholesalerProfile();
        if (profile == null) {
            profile = new WholesalerProfile();
            profile.setUser(user);
            user.setWholesalerProfile(profile);
        }

        profile.setShopName(req.getShopName().trim());
        profile.setAddress(req.getAddress() != null ? req.getAddress().trim() : null);
        profile.setCity(req.getCity() != null ? req.getCity().trim() : null);
        profile.setState(req.getState() != null ? req.getState().trim() : null);

        if (req.getPincode() != null && !req.getPincode().trim().isEmpty()) {
            String pin = req.getPincode().trim();
            if (pin.length() != 6 || !pin.matches("\\d{6}")) {
                throw new RuntimeException("Please enter a valid 6-digit Pincode.");
            }
            profile.setPincode(pin);
        } else {
            profile.setPincode(null);
        }

        profile.setGstNumber(req.getGstNumber() != null ? req.getGstNumber().trim().toUpperCase() : null);

        User savedUser = userRepository.save(user);
        return mapToDto(savedUser);
    }

    public void changePassword(Long userId, ChangePasswordRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (req.getCurrentPassword() == null || req.getCurrentPassword().isEmpty()) {
            throw new RuntimeException("Current password is required.");
        }
        if (req.getNewPassword() == null || req.getNewPassword().length() < 8) {
            throw new RuntimeException("New password must be at least 8 characters long.");
        }
        if (!req.getNewPassword().equals(req.getConfirmNewPassword())) {
            throw new RuntimeException("New passwords do not match.");
        }

        if (!BCrypt.checkpw(req.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Incorrect current password.");
        }

        user.setPassword(BCrypt.hashpw(req.getNewPassword(), BCrypt.gensalt()));
        userRepository.save(user);
    }

    public WholesalerProfileDto getAdminProfile(Long adminId) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin account not found"));
        return mapToDto(admin);
    }

    private WholesalerProfileDto mapToDto(User user) {
        WholesalerProfileDto dto = new WholesalerProfileDto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setUsername(user.getUsername());
        dto.setMobile(user.getMobile());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setStatus(user.getStatus());
        dto.setCreatedAt(user.getCreatedAt());

        if (user.getWholesalerProfile() != null) {
            WholesalerProfile wp = user.getWholesalerProfile();
            dto.setShopName(wp.getShopName());
            dto.setAddress(wp.getAddress());
            dto.setCity(wp.getCity());
            dto.setState(wp.getState());
            dto.setPincode(wp.getPincode());
            dto.setGstNumber(wp.getGstNumber());
        }
        return dto;
    }
}
