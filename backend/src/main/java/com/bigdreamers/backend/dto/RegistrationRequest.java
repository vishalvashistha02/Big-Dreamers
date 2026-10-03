package com.bigdreamers.backend.dto;

public class RegistrationRequest {
    private String name;
    private String username;
    private String mobile;
    private String email;
    private String password;
    private String confirmPassword;
    private String shopName;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private String gstNumber;
    private String otp;

    public String getName()            { return name; }
    public void setName(String v)      { this.name = v; }
    public String getUsername()        { return username; }
    public void setUsername(String v)  { this.username = v; }
    public String getMobile()          { return mobile; }
    public void setMobile(String v)    { this.mobile = v; }
    public String getEmail()           { return email; }
    public void setEmail(String v)     { this.email = v; }
    public String getPassword()        { return password; }
    public void setPassword(String v)  { this.password = v; }
    public String getConfirmPassword()       { return confirmPassword; }
    public void setConfirmPassword(String v) { this.confirmPassword = v; }
    public String getShopName()        { return shopName; }
    public void setShopName(String v)  { this.shopName = v; }
    public String getAddress()         { return address; }
    public void setAddress(String v)   { this.address = v; }
    public String getCity()            { return city; }
    public void setCity(String v)      { this.city = v; }
    public String getState()           { return state; }
    public void setState(String v)     { this.state = v; }
    public String getPincode()         { return pincode; }
    public void setPincode(String v)   { this.pincode = v; }
    public String getGstNumber()       { return gstNumber; }
    public void setGstNumber(String v) { this.gstNumber = v; }
    public String getOtp()             { return otp; }
    public void setOtp(String v)       { this.otp = v; }
}
