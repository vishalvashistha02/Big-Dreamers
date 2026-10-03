package com.bigdreamers.backend.service;

import com.bigdreamers.backend.dto.PaymentRequest;
import com.bigdreamers.backend.entity.Order;
import com.bigdreamers.backend.entity.Payment;
import com.bigdreamers.backend.entity.User;
import com.bigdreamers.backend.repository.OrderRepository;
import com.bigdreamers.backend.repository.PaymentRepository;
import com.bigdreamers.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public Payment processPayment(Long userId, PaymentRequest request) {
        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Payment amount must be greater than zero.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found."));

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found."));

        if (!order.getUser().getId().equals(userId)) {
            throw new RuntimeException("You are not authorized to make a payment for this order.");
        }

        BigDecimal remainingAmount = order.getTotalAmount().subtract(order.getPaidAmount());

        if (request.getAmount().compareTo(remainingAmount) > 0) {
            throw new RuntimeException("Payment amount cannot exceed the remaining balance.");
        }

        if (remainingAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("This order is already fully paid.");
        }

        // Create Payment Record
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setUser(user);
        payment.setAmount(request.getAmount());
        payment.setTransactionReference(UUID.randomUUID().toString());
        payment.setStatus("SUCCESS");

        Payment savedPayment = paymentRepository.save(payment);

        // Update Order
        BigDecimal newPaidAmount = order.getPaidAmount().add(request.getAmount());
        order.setPaidAmount(newPaidAmount);

        if (newPaidAmount.compareTo(order.getTotalAmount()) >= 0) {
            order.setPaymentStatus("PAID");
        } else if (newPaidAmount.compareTo(BigDecimal.ZERO) > 0) {
            order.setPaymentStatus("PARTIALLY_PAID");
        } else {
            order.setPaymentStatus("UNPAID");
        }

        orderRepository.save(order);

        return savedPayment;
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public List<Payment> getPaymentsByUserId(Long userId) {
        return paymentRepository.findByUserId(userId);
    }
}
