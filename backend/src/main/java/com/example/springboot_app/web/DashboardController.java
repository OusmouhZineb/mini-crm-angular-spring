package com.example.springboot_app.web;

import com.example.springboot_app.dto.DashboardStats;
import com.example.springboot_app.dto.DashboardStats.CustomerBreakdown;
import com.example.springboot_app.dto.DashboardStats.Metric;
import com.example.springboot_app.dto.DashboardStats.MonthlyRevenue;
import com.example.springboot_app.model.Customer;
import com.example.springboot_app.model.Deal;
import com.example.springboot_app.model.DealStage;
import com.example.springboot_app.repository.CustomerRepository;
import com.example.springboot_app.repository.DealRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.function.Function;
import java.util.stream.IntStream;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DealRepository deals;
    private final CustomerRepository customers;

    public DashboardController(DealRepository deals, CustomerRepository customers) {
        this.deals = deals;
        this.customers = customers;
    }

    @GetMapping
    public DashboardStats stats() {
        List<Deal> all = deals.findAll();
        YearMonth now = YearMonth.now();
        YearMonth prev = now.minusMonths(1);

        List<Deal> won = all.stream().filter(d -> d.getStage() == DealStage.WON).toList();
        List<Deal> open = all.stream().filter(d -> d.getStage().isOpen()).toList();

        Metric revenue = metric(won, Deal::getClosedAt, now, prev, false);
        Metric pipeline = metric(open, Deal::getCreatedAt, now, prev, false);
        Metric dealsWon = metric(won, Deal::getClosedAt, now, prev, true);

        List<MonthlyRevenue> monthly = IntStream.rangeClosed(1, 12)
                .mapToObj(m -> new MonthlyRevenue(m, sum(won.stream()
                        .filter(d -> d.getClosedAt() != null && d.getClosedAt().getYear() == now.getYear()
                                && d.getClosedAt().getMonthValue() == m)
                        .toList())))
                .toList();

        List<Customer> allCustomers = customers.findAll();
        LocalDate cutoff = LocalDate.now().minusDays(30);
        long recent = allCustomers.stream().filter(c -> !c.getCreatedAt().isBefore(cutoff)).count();
        double pct = allCustomers.isEmpty() ? 0 : Math.round(recent * 1000.0 / allCustomers.size()) / 10.0;

        return new DashboardStats(revenue, pipeline, dealsWon, monthly,
                new CustomerBreakdown(allCustomers.size(), recent, pct));
    }

    /** Total value (or count) of the list, plus the month-over-month change by the given date. */
    private Metric metric(List<Deal> list, Function<Deal, LocalDate> dateOf, YearMonth now, YearMonth prev,
                          boolean count) {
        Function<List<Deal>, BigDecimal> agg = l -> count ? BigDecimal.valueOf(l.size()) : sum(l);
        BigDecimal thisMonth = agg.apply(inMonth(list, dateOf, now));
        BigDecimal lastMonth = agg.apply(inMonth(list, dateOf, prev));
        double change = lastMonth.signum() == 0
                ? (thisMonth.signum() == 0 ? 0 : 100)
                : Math.round(thisMonth.subtract(lastMonth).doubleValue() / lastMonth.doubleValue() * 1000) / 10.0;
        return new Metric(agg.apply(list), change);
    }

    private List<Deal> inMonth(List<Deal> list, Function<Deal, LocalDate> dateOf, YearMonth ym) {
        return list.stream()
                .filter(d -> dateOf.apply(d) != null && YearMonth.from(dateOf.apply(d)).equals(ym))
                .toList();
    }

    private BigDecimal sum(List<Deal> l) {
        return l.stream().map(Deal::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
