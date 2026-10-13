package com.example.springboot_app.dto;

import com.example.springboot_app.model.Deal;
import com.example.springboot_app.model.DealStage;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DealResponse(Long id, String title, String description, BigDecimal amount, DealStage stage,
                           Long customerId, String customerName, LocalDate createdAt, LocalDate closedAt) {

    public static DealResponse from(Deal d) {
        return new DealResponse(d.getId(), d.getTitle(), d.getDescription(), d.getAmount(), d.getStage(),
                d.getCustomer().getId(), d.getCustomer().getName(), d.getCreatedAt(), d.getClosedAt());
    }
}
