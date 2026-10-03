package com.bigdreamers.backend.service;

import com.bigdreamers.backend.dto.LedgerResponse;
import com.bigdreamers.backend.dto.LedgerSummaryDto;
import com.bigdreamers.backend.dto.LedgerTransactionDto;
import com.bigdreamers.backend.entity.Order;
import com.bigdreamers.backend.entity.Payment;
import com.bigdreamers.backend.repository.OrderRepository;
import com.bigdreamers.backend.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class LedgerService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    public LedgerResponse getLedgerForUser(Long userId) {
        List<Order> orders = orderRepository.findByUserId(userId);
        List<Payment> payments = paymentRepository.findByUserId(userId);

        List<LedgerTransactionDto> transactions = new ArrayList<>();
        BigDecimal totalOrderAmount = BigDecimal.ZERO;
        BigDecimal totalPaid = BigDecimal.ZERO;

        if (orders != null) {
            for (Order order : orders) {
                LedgerTransactionDto t = new LedgerTransactionDto();
                LocalDateTime orderDt = order.getOrderDate() != null ? order.getOrderDate() : 
                                       (order.getCreatedAt() != null ? order.getCreatedAt() : LocalDateTime.now());
                t.setDate(orderDt);
                t.setType("ORDER");
                t.setReference("ORD" + order.getId());
                t.setDescription("Order Placed");
                BigDecimal amt = order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO;
                t.setDebit(amt);
                t.setCredit(null);
                transactions.add(t);
                totalOrderAmount = totalOrderAmount.add(amt);
            }
        }

        if (payments != null) {
            for (Payment payment : payments) {
                if ("SUCCESS".equalsIgnoreCase(payment.getStatus())) {
                    LedgerTransactionDto t = new LedgerTransactionDto();
                    LocalDateTime payDt = payment.getPaymentDate() != null ? payment.getPaymentDate() : 
                                         (payment.getCreatedAt() != null ? payment.getCreatedAt() : LocalDateTime.now());
                    t.setDate(payDt);
                    t.setType("PAYMENT");
                    t.setReference("PAY" + payment.getId());
                    t.setDescription("Payment Received" + (payment.getPaymentMethod() != null ? " (" + payment.getPaymentMethod() + ")" : ""));
                    BigDecimal amt = payment.getAmount() != null ? payment.getAmount() : BigDecimal.ZERO;
                    t.setDebit(null);
                    t.setCredit(amt);
                    transactions.add(t);
                    totalPaid = totalPaid.add(amt);
                }
            }
        }

        // Sort chronologically ascending to compute running balances
        transactions.sort(Comparator.comparing(LedgerTransactionDto::getDate, Comparator.nullsLast(Comparator.naturalOrder())));

        BigDecimal runningBalance = BigDecimal.ZERO;
        for (LedgerTransactionDto t : transactions) {
            if ("ORDER".equals(t.getType()) && t.getDebit() != null) {
                runningBalance = runningBalance.add(t.getDebit());
            } else if ("PAYMENT".equals(t.getType()) && t.getCredit() != null) {
                runningBalance = runningBalance.subtract(t.getCredit());
            }
            if (runningBalance.compareTo(BigDecimal.ZERO) < 0) {
                runningBalance = BigDecimal.ZERO;
            }
            t.setBalance(runningBalance);
        }
        
        // Sort descending so the latest transaction is at top
        transactions.sort((a, b) -> {
            if (a.getDate() == null && b.getDate() == null) return 0;
            if (a.getDate() == null) return 1;
            if (b.getDate() == null) return -1;
            return b.getDate().compareTo(a.getDate());
        });

        BigDecimal totalDue = totalOrderAmount.subtract(totalPaid);
        if (totalDue.compareTo(BigDecimal.ZERO) < 0) {
            totalDue = BigDecimal.ZERO;
        }

        LedgerSummaryDto summary = new LedgerSummaryDto();
        summary.setTotalOrders(orders != null ? orders.size() : 0);
        summary.setTotalOrderAmount(totalOrderAmount);
        summary.setTotalPaid(totalPaid);
        summary.setTotalDue(totalDue);

        return new LedgerResponse(summary, transactions);
    }
}
