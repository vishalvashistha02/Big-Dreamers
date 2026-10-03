package com.bigdreamers.backend.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class AdminDashboardDto {
    private DashboardSummary summary;
    private Map<String, Long> orderStatusCounts;
    private Map<String, List<SalesTrendItem>> salesTrends;
    private List<RecentOrder> recentOrders;
    private List<RecentPayment> recentPayments;
    private List<TopWholesaler> topWholesalers;
    private List<LowStockProduct> lowStockProducts;

    public static class DashboardSummary {
        private long totalWholesalers;
        private long totalProducts;
        private long totalOrders;
        private BigDecimal totalSales;
        private BigDecimal totalReceived;
        private BigDecimal totalOutstanding;

        public long getTotalWholesalers() { return totalWholesalers; }
        public void setTotalWholesalers(long totalWholesalers) { this.totalWholesalers = totalWholesalers; }

        public long getTotalProducts() { return totalProducts; }
        public void setTotalProducts(long totalProducts) { this.totalProducts = totalProducts; }

        public long getTotalOrders() { return totalOrders; }
        public void setTotalOrders(long totalOrders) { this.totalOrders = totalOrders; }

        public BigDecimal getTotalSales() { return totalSales; }
        public void setTotalSales(BigDecimal totalSales) { this.totalSales = totalSales; }

        public BigDecimal getTotalReceived() { return totalReceived; }
        public void setTotalReceived(BigDecimal totalReceived) { this.totalReceived = totalReceived; }

        public BigDecimal getTotalOutstanding() { return totalOutstanding; }
        public void setTotalOutstanding(BigDecimal totalOutstanding) { this.totalOutstanding = totalOutstanding; }
    }

    public static class SalesTrendItem {
        private String date;
        private String label;
        private BigDecimal sales;
        private int orderCount;

        public SalesTrendItem() {}
        public SalesTrendItem(String date, String label, BigDecimal sales, int orderCount) {
            this.date = date;
            this.label = label;
            this.sales = sales;
            this.orderCount = orderCount;
        }

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }

        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }

        public BigDecimal getSales() { return sales; }
        public void setSales(BigDecimal sales) { this.sales = sales; }

        public int getOrderCount() { return orderCount; }
        public void setOrderCount(int orderCount) { this.orderCount = orderCount; }
    }

    public static class RecentOrder {
        private Long id;
        private String wholesalerName;
        private String shopName;
        private BigDecimal totalAmount;
        private String orderDate;
        private String status;
        private String paymentStatus;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getWholesalerName() { return wholesalerName; }
        public void setWholesalerName(String wholesalerName) { this.wholesalerName = wholesalerName; }

        public String getShopName() { return shopName; }
        public void setShopName(String shopName) { this.shopName = shopName; }

        public BigDecimal getTotalAmount() { return totalAmount; }
        public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

        public String getOrderDate() { return orderDate; }
        public void setOrderDate(String orderDate) { this.orderDate = orderDate; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getPaymentStatus() { return paymentStatus; }
        public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
    }

    public static class RecentPayment {
        private Long id;
        private Long orderId;
        private String wholesalerName;
        private BigDecimal amount;
        private String paymentDate;
        private String paymentMethod;
        private String status;
        private String transactionReference;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Long getOrderId() { return orderId; }
        public void setOrderId(Long orderId) { this.orderId = orderId; }

        public String getWholesalerName() { return wholesalerName; }
        public void setWholesalerName(String wholesalerName) { this.wholesalerName = wholesalerName; }

        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }

        public String getPaymentDate() { return paymentDate; }
        public void setPaymentDate(String paymentDate) { this.paymentDate = paymentDate; }

        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getTransactionReference() { return transactionReference; }
        public void setTransactionReference(String transactionReference) { this.transactionReference = transactionReference; }
    }

    public static class TopWholesaler {
        private Long id;
        private String name;
        private String shopName;
        private String mobile;
        private int totalOrders;
        private BigDecimal totalPurchaseAmount;
        private BigDecimal totalPaid;
        private BigDecimal totalDue;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getShopName() { return shopName; }
        public void setShopName(String shopName) { this.shopName = shopName; }

        public String getMobile() { return mobile; }
        public void setMobile(String mobile) { this.mobile = mobile; }

        public int getTotalOrders() { return totalOrders; }
        public void setTotalOrders(int totalOrders) { this.totalOrders = totalOrders; }

        public BigDecimal getTotalPurchaseAmount() { return totalPurchaseAmount; }
        public void setTotalPurchaseAmount(BigDecimal totalPurchaseAmount) { this.totalPurchaseAmount = totalPurchaseAmount; }

        public BigDecimal getTotalPaid() { return totalPaid; }
        public void setTotalPaid(BigDecimal totalPaid) { this.totalPaid = totalPaid; }

        public BigDecimal getTotalDue() { return totalDue; }
        public void setTotalDue(BigDecimal totalDue) { this.totalDue = totalDue; }
    }

    public static class LowStockProduct {
        private Long id;
        private String productName;
        private String sku;
        private String category;
        private BigDecimal wholesalePrice;
        private Integer stockQuantity;
        private String imageUrl;
        private String status;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getProductName() { return productName; }
        public void setProductName(String productName) { this.productName = productName; }

        public String getSku() { return sku; }
        public void setSku(String sku) { this.sku = sku; }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }

        public BigDecimal getWholesalePrice() { return wholesalePrice; }
        public void setWholesalePrice(BigDecimal wholesalePrice) { this.wholesalePrice = wholesalePrice; }

        public Integer getStockQuantity() { return stockQuantity; }
        public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }

        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    // Getters and Setters for AdminDashboardDto
    public DashboardSummary getSummary() { return summary; }
    public void setSummary(DashboardSummary summary) { this.summary = summary; }

    public Map<String, Long> getOrderStatusCounts() { return orderStatusCounts; }
    public void setOrderStatusCounts(Map<String, Long> orderStatusCounts) { this.orderStatusCounts = orderStatusCounts; }

    public Map<String, List<SalesTrendItem>> getSalesTrends() { return salesTrends; }
    public void setSalesTrends(Map<String, List<SalesTrendItem>> salesTrends) { this.salesTrends = salesTrends; }

    public List<RecentOrder> getRecentOrders() { return recentOrders; }
    public void setRecentOrders(List<RecentOrder> recentOrders) { this.recentOrders = recentOrders; }

    public List<RecentPayment> getRecentPayments() { return recentPayments; }
    public void setRecentPayments(List<RecentPayment> recentPayments) { this.recentPayments = recentPayments; }

    public List<TopWholesaler> getTopWholesalers() { return topWholesalers; }
    public void setTopWholesalers(List<TopWholesaler> topWholesalers) { this.topWholesalers = topWholesalers; }

    public List<LowStockProduct> getLowStockProducts() { return lowStockProducts; }
    public void setLowStockProducts(List<LowStockProduct> lowStockProducts) { this.lowStockProducts = lowStockProducts; }
}
