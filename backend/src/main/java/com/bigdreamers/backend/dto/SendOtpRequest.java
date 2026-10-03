package com.bigdreamers.backend.dto;

public class SendOtpRequest {
    private String name;
    private String mobile;
    private String shopName;

    public String getName()     { return name; }
    public void setName(String name)     { this.name = name; }
    public String getMobile()   { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }
    public String getShopName() { return shopName; }
    public void setShopName(String shopName) { this.shopName = shopName; }
}
