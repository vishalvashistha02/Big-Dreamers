package com.bigdreamers.backend.service;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory OTP store for development/testing.
 *
 * ⚠️ DEVELOPMENT ONLY — replace with a real SMS provider before going to production.
 *
 * To integrate a real SMS provider (Twilio, MSG91, Fast2SMS, etc.):
 *   1. Add the provider SDK to build.gradle
 *   2. Inject the provider client in this service
 *   3. Replace the System.out.println below with the provider's sendSms() method
 *   4. The rest of the OTP lifecycle (expiry, invalidation, rate-limiting) stays the same
 */
@Service
public class OtpService {

    private static final int OTP_LENGTH       = 6;
    private static final int OTP_TTL_MINUTES  = 5;
    private static final int MAX_ATTEMPTS     = 5;
    private static final int MAX_SENDS        = 3;   // per 10-minute window

    private final SecureRandom random = new SecureRandom();

    // Stores: mobile -> OtpEntry
    private final Map<String, OtpEntry> store = new ConcurrentHashMap<>();
    // Rate-limit: mobile -> send count (cleared after 10 min)
    private final Map<String, SendRecord> sendRecords = new ConcurrentHashMap<>();

    // ─────────────────────────── Public API ──────────────────────────────────

    /**
     * Generate, (mock-)send, and store a new OTP for the given mobile number.
     * Enforces send-rate limiting.
     */
    /**
     * Returns the generated OTP string so the controller can include it
     * in the API response during DEVELOPMENT mode only.
     * In production: remove devOtp from API responses and use real SMS here.
     */
    public String generateAndSend(String mobile) {
        SendRecord rec = sendRecords.computeIfAbsent(mobile, k -> new SendRecord());

        // Reset counter if window has expired
        if (rec.windowStart.isBefore(LocalDateTime.now().minusMinutes(10))) {
            rec.count       = 0;
            rec.windowStart = LocalDateTime.now();
        }

        if (rec.count >= MAX_SENDS) {
            throw new RuntimeException("Too many OTP requests. Please wait before requesting a new OTP.");
        }

        String otp = generateOtp();
        store.put(mobile, new OtpEntry(otp, LocalDateTime.now().plusMinutes(OTP_TTL_MINUTES)));
        rec.count++;

        // ── DEVELOPMENT ONLY ── Replace println with real SMS provider ──────
        System.out.println("===================================================");
        System.out.println("  [DEV MODE] OTP for mobile " + mobile + " : " + otp);
        System.out.println("  (This would be sent via SMS in production)");
        System.out.println("===================================================");
        // ────────────────────────────────────────────────────────────────────

        return otp; // ⚠️ REMOVE from API response before going to production
    }

    /**
     * Verify the OTP. Returns true on success and invalidates the OTP.
     * Increments attempt counter; throws if too many wrong attempts.
     */
    public boolean verify(String mobile, String otp) {
        OtpEntry entry = store.get(mobile);

        if (entry == null) {
            throw new RuntimeException("No OTP found. Please request a new OTP.");
        }
        if (LocalDateTime.now().isAfter(entry.expiresAt)) {
            store.remove(mobile);
            throw new RuntimeException("OTP has expired. Please request a new OTP.");
        }
        if (entry.attempts >= MAX_ATTEMPTS) {
            store.remove(mobile);
            throw new RuntimeException("Too many incorrect attempts. Please request a new OTP.");
        }

        if (!entry.otp.equals(otp)) {
            entry.attempts++;
            int remaining = MAX_ATTEMPTS - entry.attempts;
            throw new RuntimeException("Invalid OTP. " + remaining + " attempt(s) remaining.");
        }

        // Valid — invalidate immediately (one-time use)
        store.remove(mobile);
        return true;
    }

    // ─────────────────────────── Helpers ─────────────────────────────────────

    private String generateOtp() {
        int num = random.nextInt((int) Math.pow(10, OTP_LENGTH));
        return String.format("%0" + OTP_LENGTH + "d", num);
    }

    // ─────────────────────────── Inner classes ────────────────────────────────

    private static class OtpEntry {
        final String otp;
        final LocalDateTime expiresAt;
        int attempts = 0;

        OtpEntry(String otp, LocalDateTime expiresAt) {
            this.otp       = otp;
            this.expiresAt = expiresAt;
        }
    }

    private static class SendRecord {
        int count = 0;
        LocalDateTime windowStart = LocalDateTime.now();
    }
}
