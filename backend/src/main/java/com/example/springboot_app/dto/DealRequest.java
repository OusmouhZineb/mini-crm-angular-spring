package com.example.springboot_app.dto;

import com.example.springboot_app.model.DealStage;

import java.math.BigDecimal;

public record DealRequest(String title, String description, BigDecimal amount, DealStage stage, Long customerId) {
}
