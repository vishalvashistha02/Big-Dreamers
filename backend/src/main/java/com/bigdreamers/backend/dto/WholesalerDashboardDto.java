package com.bigdreamers.backend.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class WholesalerDashboardDto {
    private ProfileSummary profile;
    private DashboardSummary summary;
    private Map<String, Long> orderStatusCounts;
    private Map<String, List<PurchaseTrendItem>> purchaseTrends;
    private List<RecentOrder> recentOrders;
    private List<RecentPayment> recentPayments;

    public static class ProfileSummary {
        private Long id;
        private String name;
        private String username;
        private String shopName;
        private String mobile;
        private String email;
        private String address;
        private String city;
        private String state;
        private String pincode;
        private String gstNumber;
        private String status;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }

        public String getShopName() { return shopName; }
        public void setShopName(String shopName) { this.shopName = shopName; }

        public String getMobile() { return mobile; }
        public void setMobile(String mobile) { this.mobile = mobile; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }

        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }

        public String getState() { return state; }
        public void setState(String state) { this.state = state; }

        public String getPincode() { return pincode; }
        public void setPincode(String pincode) { this.pincode = pincode; }

        public String getGstNumber() { return gstNumber; }
        public void setGstNumber(String gstNumber) { this.gstNumber = gstNumber; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class DashboardSummary {
        private int totalOrders;
        private BigDecimal totalPurchase;
        private BigDecimal totalPaid;
        private BigDecimal totalDue;

        public int getTotalOrders() { return totalOrders; }
        public void setTotalOrders(int totalOrders) { this.totalOrders = totalOrders; }

        public BigDecimal getTotalPurchase() { return totalPurchase; }
        public void setTotalPurchase(BigDecimal totalPurchase) { this.totalPurchase = totalPurchase; }

        public BigDecimal getTotalPaid() { return totalPaid; }
        public void setTotalPaid(BigDecimal totalPaid) { this.totalPaid = totalPaid; }

        public BigDecimal getTotalDue() { return totalDue; }
        public void setTotalDue(BigDecimal totalDue) { this.totalDue = totalDue; }
    }

    public static class PurchaseTrendItem {
        private String date;
        private String label;
        private BigDecimal amount;
        private int orderCount;

        public PurchaseTrendItem() {}
        public PurchaseTrendItem(String date, String label, BigDecimal amount, int orderCount) {
            this.date = date;
            this.label = label;
            this.amount = amount;
            this.orderCount = orderCount;
        }

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }

        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }

        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }

        public int getOrderCount() { return orderCount; }
        public void setOrderCount(int orderCount) { this.orderCount = orderCount; }
    }

    public static class RecentOrder {
        private Long id;
        private String orderDate;
        private BigDecimal totalAmount;
        private BigDecimal paidAmount;
        private BigDecimal dueAmount;
        private String orderStatus;
        private String paymentStatus;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getOrderDate() { return orderDate; }
        public void setOrderDate(String orderDate) { this.orderDate = orderDate; }

        public BigDecimal getTotalAmount() { return totalAmount; }
        public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

        public BigDecimal getPaidAmount() { return paidAmount; }
        public void setPaidAmount(BigDecimal paidAmount) { this.paidAmount = paidAmount; }

        public BigDecimal getDueAmount() { return dueAmount; }
        public void setDueAmount(BigDecimal dueAmount) { this.dueAmount = dueAmount; }

        public String getOrderStatus() { return orderStatus; }
        public void setOrderStatus(String orderStatus) { this.orderStatus = orderStatus; }

        public String getPaymentStatus() { return paymentStatus; }
        public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
    }

    public static class RecentPayment {
        private Long id;
        private Long orderId;
        private BigDecimal amount;
        private String paymentDate;
        private String paymentMethod;
        private String status;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Long getOrderId() { return orderId; }
        public void setOrderId(Long orderId) { this.orderId = orderId; }

        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }

        public String getPaymentDate() { return paymentDate; }
        public void setPaymentDate(String paymentDate) { this.paymentDate = paymentDate; }

        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    // Getters and Setters
    public ProfileSummary getProfile() { return profile; }
    public void setProfile(ProfileSummary profile) { this.profile = profile; }

    public DashboardSummary getSummary() { return summary; }
    public void setSummary(DashboardSummary summary) { this.summary = summary; }

    public Map<String, Long> getOrderStatusCounts() { return orderStatusCounts; }
    public void setOrderStatusCounts(Map<String, Long> orderStatusCounts) { this.orderStatusCounts = orderStatusCounts; }

    public Map<String, List<PurchaseTrendItem>> getPurchaseTrends() { return purchaseTrends; }
    public void setPurchaseTrends(Map<String, List<PurchaseTrendItem>> purchaseTrends) { this.purchaseTrends = purchaseTrends; }

    public List<RecentOrder> getRecentOrders() { return recentOrders; }
    public void setRecentOrders(List<RecentOrder> recentOrders) { this.recentOrders = recentOrders; }

    public List<RecentPayment> getRecentPayments() { return recentPayments; }
    public void setRecentPayments(List<RecentPayment> recentPayments) { this.recentPayments = recentPayments; }
}
