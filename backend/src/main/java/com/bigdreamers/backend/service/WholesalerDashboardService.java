package com.bigdreamers.backend.service;

import com.bigdreamers.backend.dto.WholesalerDashboardDto;
import com.bigdreamers.backend.entity.Order;
import com.bigdreamers.backend.entity.Payment;
import com.bigdreamers.backend.entity.User;
import com.bigdreamers.backend.entity.WholesalerProfile;
import com.bigdreamers.backend.repository.OrderRepository;
import com.bigdreamers.backend.repository.PaymentRepository;
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
public class WholesalerDashboardService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    public WholesalerDashboardDto getDashboardForUser(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            throw new RuntimeException("Wholesaler user not found");
        }

        List<Order> orders = orderRepository.findByUserId(userId);
        List<Payment> payments = paymentRepository.findByUserId(userId);

        WholesalerDashboardDto dto = new WholesalerDashboardDto();

        // 1. Profile Summary
        WholesalerDashboardDto.ProfileSummary profile = new WholesalerDashboardDto.ProfileSummary();
        profile.setId(user.getId());
        profile.setName(user.getName());
        profile.setUsername(user.getUsername());
        profile.setMobile(user.getMobile());
        profile.setEmail(user.getEmail());
        profile.setStatus(user.getStatus());

        WholesalerProfile wp = user.getWholesalerProfile();
        if (wp != null) {
            profile.setShopName(wp.getShopName());
            profile.setAddress(wp.getAddress());
            profile.setCity(wp.getCity());
            profile.setState(wp.getState());
            profile.setPincode(wp.getPincode());
            profile.setGstNumber(wp.getGstNumber());
        }
        dto.setProfile(profile);

        // 2. Summary Cards
        WholesalerDashboardDto.DashboardSummary summary = new WholesalerDashboardDto.DashboardSummary();
        summary.setTotalOrders(orders != null ? orders.size() : 0);

        BigDecimal totalPurchase = BigDecimal.ZERO;
        if (orders != null) {
            for (Order o : orders) {
                if (o.getTotalAmount() != null && !"CANCELLED".equalsIgnoreCase(o.getStatus())) {
                    totalPurchase = totalPurchase.add(o.getTotalAmount());
                }
            }
        }
        summary.setTotalPurchase(totalPurchase);

        BigDecimal totalPaid = BigDecimal.ZERO;
        if (payments != null) {
            for (Payment p : payments) {
                if ("SUCCESS".equalsIgnoreCase(p.getStatus()) && p.getAmount() != null) {
                    totalPaid = totalPaid.add(p.getAmount());
                }
            }
        }
        summary.setTotalPaid(totalPaid);

        BigDecimal totalDue = totalPurchase.subtract(totalPaid);
        if (totalDue.compareTo(BigDecimal.ZERO) < 0) {
            totalDue = BigDecimal.ZERO;
        }
        summary.setTotalDue(totalDue);
        dto.setSummary(summary);

        // 3. Order Status Counts
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

        // 4. Purchase Trends (Last 7 Days, Last 30 Days, This Month)
        Map<String, List<WholesalerDashboardDto.PurchaseTrendItem>> purchaseTrends = new HashMap<>();
        purchaseTrends.put("last7Days", generatePurchaseTrend(orders, 7));
        purchaseTrends.put("last30Days", generatePurchaseTrend(orders, 30));
        purchaseTrends.put("thisMonth", generateThisMonthPurchaseTrend(orders));
        dto.setPurchaseTrends(purchaseTrends);

        // 5. Recent Orders (Top 5)
        List<WholesalerDashboardDto.RecentOrder> recentOrders = new ArrayList<>();
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
                    .limit(5)
                    .collect(Collectors.toList());

            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");
            for (Order o : sortedOrders) {
                WholesalerDashboardDto.RecentOrder ro = new WholesalerDashboardDto.RecentOrder();
                ro.setId(o.getId());
                LocalDateTime dt = o.getOrderDate() != null ? o.getOrderDate() : o.getCreatedAt();
                ro.setOrderDate(dt != null ? dt.format(dtf) : "N/A");
                BigDecimal tot = o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO;
                BigDecimal paid = o.getPaidAmount() != null ? o.getPaidAmount() : BigDecimal.ZERO;
                BigDecimal due = tot.subtract(paid);
                if (due.compareTo(BigDecimal.ZERO) < 0) {
                    due = BigDecimal.ZERO;
                }
                ro.setTotalAmount(tot);
                ro.setPaidAmount(paid);
                ro.setDueAmount(due);
                ro.setOrderStatus(o.getStatus() != null ? o.getStatus() : "PENDING");
                ro.setPaymentStatus(o.getPaymentStatus() != null ? o.getPaymentStatus() : "UNPAID");
                recentOrders.add(ro);
            }
        }
        dto.setRecentOrders(recentOrders);

        // 6. Recent Payments (Top 5)
        List<WholesalerDashboardDto.RecentPayment> recentPayments = new ArrayList<>();
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
                    .limit(5)
                    .collect(Collectors.toList());

            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");
            for (Payment p : sortedPayments) {
                WholesalerDashboardDto.RecentPayment rp = new WholesalerDashboardDto.RecentPayment();
                rp.setId(p.getId());
                rp.setOrderId(p.getOrder() != null ? p.getOrder().getId() : null);
                rp.setAmount(p.getAmount() != null ? p.getAmount() : BigDecimal.ZERO);
                LocalDateTime dt = p.getPaymentDate() != null ? p.getPaymentDate() : p.getCreatedAt();
                rp.setPaymentDate(dt != null ? dt.format(dtf) : "N/A");
                rp.setPaymentMethod(p.getPaymentMethod() != null ? p.getPaymentMethod() : "DEMO");
                rp.setStatus(p.getStatus() != null ? p.getStatus() : "SUCCESS");
                recentPayments.add(rp);
            }
        }
        dto.setRecentPayments(recentPayments);

        return dto;
    }

    private List<WholesalerDashboardDto.PurchaseTrendItem> generatePurchaseTrend(List<Order> orders, int days) {
        List<WholesalerDashboardDto.PurchaseTrendItem> trend = new ArrayList<>();
        LocalDate today = LocalDate.now();
        DateTimeFormatter keyFmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        DateTimeFormatter labelFmt = DateTimeFormatter.ofPattern("dd MMM");

        Map<String, BigDecimal> amountMap = new HashMap<>();
        Map<String, Integer> countMap = new HashMap<>();

        if (orders != null) {
            for (Order o : orders) {
                if ("CANCELLED".equalsIgnoreCase(o.getStatus())) continue;
                LocalDateTime ldt = o.getOrderDate() != null ? o.getOrderDate() : o.getCreatedAt();
                if (ldt != null) {
                    String k = ldt.toLocalDate().format(keyFmt);
                    BigDecimal amt = o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO;
                    amountMap.put(k, amountMap.getOrDefault(k, BigDecimal.ZERO).add(amt));
                    countMap.put(k, countMap.getOrDefault(k, 0) + 1);
                }
            }
        }

        for (int i = days - 1; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            String k = d.format(keyFmt);
            String label = d.format(labelFmt);
            BigDecimal a = amountMap.getOrDefault(k, BigDecimal.ZERO);
            int count = countMap.getOrDefault(k, 0);
            trend.add(new WholesalerDashboardDto.PurchaseTrendItem(k, label, a, count));
        }

        return trend;
    }

    private List<WholesalerDashboardDto.PurchaseTrendItem> generateThisMonthPurchaseTrend(List<Order> orders) {
        List<WholesalerDashboardDto.PurchaseTrendItem> trend = new ArrayList<>();
        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.withDayOfMonth(1);

        DateTimeFormatter keyFmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        DateTimeFormatter labelFmt = DateTimeFormatter.ofPattern("dd MMM");

        Map<String, BigDecimal> amountMap = new HashMap<>();
        Map<String, Integer> countMap = new HashMap<>();

        if (orders != null) {
            for (Order o : orders) {
                if ("CANCELLED".equalsIgnoreCase(o.getStatus())) continue;
                LocalDateTime ldt = o.getOrderDate() != null ? o.getOrderDate() : o.getCreatedAt();
                if (ldt != null) {
                    String k = ldt.toLocalDate().format(keyFmt);
                    BigDecimal amt = o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO;
                    amountMap.put(k, amountMap.getOrDefault(k, BigDecimal.ZERO).add(amt));
                    countMap.put(k, countMap.getOrDefault(k, 0) + 1);
                }
            }
        }

        LocalDate cur = startOfMonth;
        while (!cur.isAfter(today)) {
            String k = cur.format(keyFmt);
            String label = cur.format(labelFmt);
            BigDecimal a = amountMap.getOrDefault(k, BigDecimal.ZERO);
            int count = countMap.getOrDefault(k, 0);
            trend.add(new WholesalerDashboardDto.PurchaseTrendItem(k, label, a, count));
            cur = cur.plusDays(1);
        }

        return trend;
    }
}
