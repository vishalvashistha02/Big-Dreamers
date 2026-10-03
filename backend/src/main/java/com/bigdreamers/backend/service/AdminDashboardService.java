package com.bigdreamers.backend.service;

import com.bigdreamers.backend.dto.AdminDashboardDto;
import com.bigdreamers.backend.entity.Order;
import com.bigdreamers.backend.entity.Payment;
import com.bigdreamers.backend.entity.Product;
import com.bigdreamers.backend.entity.User;
import com.bigdreamers.backend.repository.OrderRepository;
import com.bigdreamers.backend.repository.PaymentRepository;
import com.bigdreamers.backend.repository.ProductRepository;
import com.bigdreamers.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminDashboardService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    public AdminDashboardDto getDashboardData(Integer lowStockThreshold) {
        if (lowStockThreshold == null || lowStockThreshold < 0) {
            lowStockThreshold = 10;
        }

        List<User> wholesalers = userRepository.findByRole("WHOLESALER");
        List<Product> products = productRepository.findAll();
        List<Order> orders = orderRepository.findAll();
        List<Payment> payments = paymentRepository.findAll();

        AdminDashboardDto dto = new AdminDashboardDto();

        // 1. Summary Cards
        AdminDashboardDto.DashboardSummary summary = new AdminDashboardDto.DashboardSummary();
        summary.setTotalWholesalers(wholesalers != null ? wholesalers.size() : 0);
        summary.setTotalProducts(products != null ? products.size() : 0);
        summary.setTotalOrders(orders != null ? orders.size() : 0);

        BigDecimal totalSales = BigDecimal.ZERO;
        if (orders != null) {
            for (Order o : orders) {
                if (o.getTotalAmount() != null && !"CANCELLED".equalsIgnoreCase(o.getStatus())) {
                    totalSales = totalSales.add(o.getTotalAmount());
                }
            }
        }
        summary.setTotalSales(totalSales);

        BigDecimal totalReceived = BigDecimal.ZERO;
        if (payments != null) {
            for (Payment p : payments) {
                if ("SUCCESS".equalsIgnoreCase(p.getStatus()) && p.getAmount() != null) {
                    totalReceived = totalReceived.add(p.getAmount());
                }
            }
        }
        summary.setTotalReceived(totalReceived);

        BigDecimal totalOutstanding = totalSales.subtract(totalReceived);
        if (totalOutstanding.compareTo(BigDecimal.ZERO) < 0) {
            totalOutstanding = BigDecimal.ZERO;
        }
        summary.setTotalOutstanding(totalOutstanding);
        dto.setSummary(summary);

        // 2. Order Status Breakdown
        Map<String, Long> statusCounts = new LinkedHashMap<>();
        statusCounts.put("PENDING", 0L);
        statusCounts.put("CONFIRMED", 0L);
        statusCounts.put("PROCESSING", 0L);
        statusCounts.put("SHIPPED", 0L);
        statusCounts.put("DELIVERED", 0L);
        statusCounts.put("CANCELLED", 0L);

        if (orders != null) {
            for (Order o : orders) {
                String st = o.getStatus() != null ? o.getStatus().toUpperCase() : "PENDING";
                statusCounts.put(st, statusCounts.getOrDefault(st, 0L) + 1);
            }
        }
        dto.setOrderStatusCounts(statusCounts);

        // 3. Sales Trends (last 7 days, last 30 days, this month)
        Map<String, List<AdminDashboardDto.SalesTrendItem>> salesTrends = new HashMap<>();
        salesTrends.put("last7Days", generateSalesTrend(orders, 7, false));
        salesTrends.put("last30Days", generateSalesTrend(orders, 30, false));
        salesTrends.put("thisMonth", generateThisMonthSalesTrend(orders));
        dto.setSalesTrends(salesTrends);

        // 4. Recent Orders (Top 8)
        List<AdminDashboardDto.RecentOrder> recentOrders = new ArrayList<>();
        if (orders != null) {
            List<Order> sortedOrders = orders.stream()
                    .sorted((a, b) -> {
                        LocalDateTime dtA = a.getOrderDate() != null ? a.getOrderDate() : a.getCreatedAt();
                        LocalDateTime dtB = b.getOrderDate() != null ? b.getOrderDate() : b.getCreatedAt();
                        if (dtA == null && dtB == null) return b.getId().compareTo(a.getId());
                        if (dtA == null) return 1;
                        if (dtB == null) return -1;
                        return dtB.compareTo(dtA);
                    })
                    .limit(8)
                    .collect(Collectors.toList());

            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");
            for (Order o : sortedOrders) {
                AdminDashboardDto.RecentOrder ro = new AdminDashboardDto.RecentOrder();
                ro.setId(o.getId());
                if (o.getUser() != null) {
                    ro.setWholesalerName(o.getUser().getName());
                    if (o.getUser().getWholesalerProfile() != null) {
                        ro.setShopName(o.getUser().getWholesalerProfile().getShopName());
                    }
                }
                ro.setTotalAmount(o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO);
                LocalDateTime dt = o.getOrderDate() != null ? o.getOrderDate() : o.getCreatedAt();
                ro.setOrderDate(dt != null ? dt.format(dtf) : "N/A");
                ro.setStatus(o.getStatus() != null ? o.getStatus() : "PENDING");
                ro.setPaymentStatus(o.getPaymentStatus() != null ? o.getPaymentStatus() : "UNPAID");
                recentOrders.add(ro);
            }
        }
        dto.setRecentOrders(recentOrders);

        // 5. Recent Payments (Top 8)
        List<AdminDashboardDto.RecentPayment> recentPayments = new ArrayList<>();
        if (payments != null) {
            List<Payment> sortedPayments = payments.stream()
                    .sorted((a, b) -> {
                        LocalDateTime dtA = a.getPaymentDate() != null ? a.getPaymentDate() : a.getCreatedAt();
                        LocalDateTime dtB = b.getPaymentDate() != null ? b.getPaymentDate() : b.getCreatedAt();
                        if (dtA == null && dtB == null) return b.getId().compareTo(a.getId());
                        if (dtA == null) return 1;
                        if (dtB == null) return -1;
                        return dtB.compareTo(dtA);
                    })
                    .limit(8)
                    .collect(Collectors.toList());

            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");
            for (Payment p : sortedPayments) {
                AdminDashboardDto.RecentPayment rp = new AdminDashboardDto.RecentPayment();
                rp.setId(p.getId());
                rp.setOrderId(p.getOrder() != null ? p.getOrder().getId() : null);
                if (p.getUser() != null) {
                    rp.setWholesalerName(p.getUser().getName());
                } else if (p.getOrder() != null && p.getOrder().getUser() != null) {
                    rp.setWholesalerName(p.getOrder().getUser().getName());
                }
                rp.setAmount(p.getAmount() != null ? p.getAmount() : BigDecimal.ZERO);
                LocalDateTime dt = p.getPaymentDate() != null ? p.getPaymentDate() : p.getCreatedAt();
                rp.setPaymentDate(dt != null ? dt.format(dtf) : "N/A");
                rp.setPaymentMethod(p.getPaymentMethod() != null ? p.getPaymentMethod() : "DEMO");
                rp.setStatus(p.getStatus() != null ? p.getStatus() : "SUCCESS");
                rp.setTransactionReference(p.getTransactionReference());
                recentPayments.add(rp);
            }
        }
        dto.setRecentPayments(recentPayments);

        // 6. Top Wholesalers
        List<AdminDashboardDto.TopWholesaler> topWholesalers = new ArrayList<>();
        if (wholesalers != null) {
            Map<Long, List<Order>> ordersByUser = (orders != null) ? 
                    orders.stream().filter(o -> o.getUser() != null && o.getUser().getId() != null)
                            .collect(Collectors.groupingBy(o -> o.getUser().getId())) : Collections.emptyMap();
            
            Map<Long, List<Payment>> paymentsByUser = (payments != null) ?
                    payments.stream().filter(p -> p.getUser() != null && p.getUser().getId() != null)
                            .collect(Collectors.groupingBy(p -> p.getUser().getId())) : Collections.emptyMap();

            for (User w : wholesalers) {
                AdminDashboardDto.TopWholesaler tw = new AdminDashboardDto.TopWholesaler();
                tw.setId(w.getId());
                tw.setName(w.getName());
                tw.setMobile(w.getMobile());
                if (w.getWholesalerProfile() != null) {
                    tw.setShopName(w.getWholesalerProfile().getShopName());
                }

                List<Order> userOrders = ordersByUser.getOrDefault(w.getId(), Collections.emptyList());
                tw.setTotalOrders(userOrders.size());

                BigDecimal userTotalPurchase = BigDecimal.ZERO;
                for (Order o : userOrders) {
                    if (o.getTotalAmount() != null && !"CANCELLED".equalsIgnoreCase(o.getStatus())) {
                        userTotalPurchase = userTotalPurchase.add(o.getTotalAmount());
                    }
                }
                tw.setTotalPurchaseAmount(userTotalPurchase);

                List<Payment> userPayments = paymentsByUser.getOrDefault(w.getId(), Collections.emptyList());
                BigDecimal userTotalPaid = BigDecimal.ZERO;
                for (Payment p : userPayments) {
                    if ("SUCCESS".equalsIgnoreCase(p.getStatus()) && p.getAmount() != null) {
                        userTotalPaid = userTotalPaid.add(p.getAmount());
                    }
                }
                tw.setTotalPaid(userTotalPaid);

                BigDecimal userDue = userTotalPurchase.subtract(userTotalPaid);
                if (userDue.compareTo(BigDecimal.ZERO) < 0) {
                    userDue = BigDecimal.ZERO;
                }
                tw.setTotalDue(userDue);

                topWholesalers.add(tw);
            }

            // Sort by totalPurchaseAmount descending
            topWholesalers.sort((a, b) -> b.getTotalPurchaseAmount().compareTo(a.getTotalPurchaseAmount()));
            if (topWholesalers.size() > 10) {
                topWholesalers = topWholesalers.subList(0, 10);
            }
        }
        dto.setTopWholesalers(topWholesalers);

        // 7. Low Stock Products
        final int threshold = lowStockThreshold;
        List<AdminDashboardDto.LowStockProduct> lowStockList = new ArrayList<>();
        if (products != null) {
            List<Product> filteredLowStock = products.stream()
                    .filter(p -> p.getStockQuantity() != null && p.getStockQuantity() <= threshold)
                    .sorted(Comparator.comparing(Product::getStockQuantity))
                    .collect(Collectors.toList());

            for (Product p : filteredLowStock) {
                AdminDashboardDto.LowStockProduct lsp = new AdminDashboardDto.LowStockProduct();
                lsp.setId(p.getId());
                lsp.setProductName(p.getProductName());
                lsp.setSku(p.getSku());
                lsp.setCategory(p.getCategory());
                lsp.setWholesalePrice(p.getWholesalePrice() != null ? p.getWholesalePrice() : BigDecimal.ZERO);
                lsp.setStockQuantity(p.getStockQuantity());
                lsp.setImageUrl(p.getImageUrl());
                lsp.setStatus(p.getStatus());
                lowStockList.add(lsp);
            }
        }
        dto.setLowStockProducts(lowStockList);

        return dto;
    }

    private List<AdminDashboardDto.SalesTrendItem> generateSalesTrend(List<Order> orders, int days, boolean monthOnly) {
        List<AdminDashboardDto.SalesTrendItem> trend = new ArrayList<>();
        LocalDate today = LocalDate.now();
        DateTimeFormatter keyFmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        DateTimeFormatter labelFmt = DateTimeFormatter.ofPattern("dd MMM");

        Map<String, BigDecimal> salesMap = new HashMap<>();
        Map<String, Integer> countMap = new HashMap<>();

        if (orders != null) {
            for (Order o : orders) {
                if ("CANCELLED".equalsIgnoreCase(o.getStatus())) continue;
                LocalDateTime ldt = o.getOrderDate() != null ? o.getOrderDate() : o.getCreatedAt();
                if (ldt != null) {
                    String k = ldt.toLocalDate().format(keyFmt);
                    BigDecimal amt = o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO;
                    salesMap.put(k, salesMap.getOrDefault(k, BigDecimal.ZERO).add(amt));
                    countMap.put(k, countMap.getOrDefault(k, 0) + 1);
                }
            }
        }

        for (int i = days - 1; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            String k = d.format(keyFmt);
            String label = d.format(labelFmt);
            BigDecimal s = salesMap.getOrDefault(k, BigDecimal.ZERO);
            int count = countMap.getOrDefault(k, 0);
            trend.add(new AdminDashboardDto.SalesTrendItem(k, label, s, count));
        }

        return trend;
    }

    private List<AdminDashboardDto.SalesTrendItem> generateThisMonthSalesTrend(List<Order> orders) {
        List<AdminDashboardDto.SalesTrendItem> trend = new ArrayList<>();
        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.withDayOfMonth(1);

        DateTimeFormatter keyFmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        DateTimeFormatter labelFmt = DateTimeFormatter.ofPattern("dd MMM");

        Map<String, BigDecimal> salesMap = new HashMap<>();
        Map<String, Integer> countMap = new HashMap<>();

        if (orders != null) {
            for (Order o : orders) {
                if ("CANCELLED".equalsIgnoreCase(o.getStatus())) continue;
                LocalDateTime ldt = o.getOrderDate() != null ? o.getOrderDate() : o.getCreatedAt();
                if (ldt != null) {
                    String k = ldt.toLocalDate().format(keyFmt);
                    BigDecimal amt = o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO;
                    salesMap.put(k, salesMap.getOrDefault(k, BigDecimal.ZERO).add(amt));
                    countMap.put(k, countMap.getOrDefault(k, 0) + 1);
                }
            }
        }

        LocalDate cur = startOfMonth;
        while (!cur.isAfter(today)) {
            String k = cur.format(keyFmt);
            String label = cur.format(labelFmt);
            BigDecimal s = salesMap.getOrDefault(k, BigDecimal.ZERO);
            int count = countMap.getOrDefault(k, 0);
            trend.add(new AdminDashboardDto.SalesTrendItem(k, label, s, count));
            cur = cur.plusDays(1);
        }

        return trend;
    }
}
