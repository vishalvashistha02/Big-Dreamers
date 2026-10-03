package com.bigdreamers.backend.dto;

public class VerifyOtpRequest {
    private String mobile;
    private String otp;

    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }
    public String getOtp()    { return otp; }
    public void setOtp(String otp) { this.otp = otp; }
}
