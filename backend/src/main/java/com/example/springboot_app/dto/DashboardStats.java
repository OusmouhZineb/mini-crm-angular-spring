package com.example.springboot_app.dto;

import java.math.BigDecimal;
import java.util.List;

public record DashboardStats(Metric revenue, Metric pipeline, Metric dealsWon,
                             List<MonthlyRevenue> monthlyRevenue, CustomerBreakdown customers) {

    /** {@code changePercent} compares this month to last month. */
    public record Metric(BigDecimal value, double changePercent) {
    }

    public record MonthlyRevenue(int month, BigDecimal amount) {
    }

    public record CustomerBreakdown(long total, long newLast30Days, double newPercent) {
    }
}
