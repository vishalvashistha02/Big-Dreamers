package com.bigdreamers.backend.dto;

public class ResetPasswordRequest {
    private String mobile;
    private String otp;
    private String newPassword;
    private String confirmPassword;

    public String getMobile()          { return mobile; }
    public void setMobile(String v)    { this.mobile = v; }
    public String getOtp()             { return otp; }
    public void setOtp(String v)       { this.otp = v; }
    public String getNewPassword()     { return newPassword; }
    public void setNewPassword(String v) { this.newPassword = v; }
    public String getConfirmPassword()       { return confirmPassword; }
    public void setConfirmPassword(String v) { this.confirmPassword = v; }
}
