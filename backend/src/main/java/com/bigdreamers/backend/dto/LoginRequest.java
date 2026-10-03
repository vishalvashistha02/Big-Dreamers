package com.bigdreamers.backend.dto;

public class LoginRequest {
    private String adminId;
    private String username;
    private String mobile;
    private String password;

    public String getAdminId() {
        if (adminId != null && !adminId.isBlank()) return adminId;
        if (username != null && !username.isBlank()) return username;
        return null;
    }

    public void setAdminId(String adminId) { this.adminId = adminId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
