package com.example.springboot_app.config;

import com.example.springboot_app.model.*;
import com.example.springboot_app.repository.CustomerRepository;
import com.example.springboot_app.repository.DealRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Fills an empty database with demo data so the dashboard has something to show. */
@Component
public class DataSeeder implements CommandLineRunner {

    private final CustomerRepository customers;
    private final DealRepository deals;

    public DataSeeder(CustomerRepository customers, DealRepository deals) {
        this.customers = customers;
        this.deals = deals;
    }

    @Override
    public void run(String... args) {
        if (customers.count() > 0) {
            return;
        }
        Customer acme = customer("Sarah Johnson", "sarah@acme.com", "+1 555 0101", "Acme Corp", CustomerStatus.ACTIVE, 200);
        Customer globex = customer("Mark Evans", "mark@globex.com", "+1 555 0102", "Globex", CustomerStatus.ACTIVE, 120);
        Customer initech = customer("Priya Patel", "priya@initech.com", "+1 555 0103", "Initech", CustomerStatus.LEAD, 20);
        Customer umbrella = customer("Lucas Martin", "lucas@umbrella.io", "+33 6 12 34 56 78", "Umbrella", CustomerStatus.LEAD, 8);
        Customer hooli = customer("Amina Benali", "amina@hooli.co", "+212 6 00 00 00 00", "Hooli", CustomerStatus.INACTIVE, 300);

        LocalDate today = LocalDate.now();
        deal("Website redesign", "New corporate website", 18500, DealStage.WON, acme, today.minusMonths(5), today.minusMonths(4));
        deal("Annual support plan", "Premium support contract", 9200, DealStage.WON, globex, today.minusMonths(3), today.minusMonths(2));
        deal("CRM integration", "Sync with their ERP", 24000, DealStage.WON, acme, today.minusMonths(2), today.minusMonths(1));
        deal("Mobile app", "iOS and Android MVP", 31000, DealStage.WON, globex, today.minusMonths(2), today.minusDays(6));
        deal("Data migration", "Legacy DB to cloud", 12800, DealStage.WON, hooli, today.minusDays(40), today.minusDays(3));
        deal("Analytics dashboard", "Custom BI reports", 15600, DealStage.PROPOSAL, initech, today.minusDays(12), null);
        deal("Security audit", "Pen-test and report", 7400, DealStage.QUALIFIED, umbrella, today.minusDays(5), null);
        deal("Training workshop", "Two-day team workshop", 3900, DealStage.NEW, initech, today.minusDays(2), null);
        deal("Legacy maintenance", "Dropped by customer", 5000, DealStage.LOST, hooli, today.minusDays(60), today.minusDays(30));
    }

    private Customer customer(String name, String email, String phone, String company, CustomerStatus status, int daysAgo) {
        Customer c = new Customer();
        c.setName(name);
        c.setEmail(email);
        c.setPhone(phone);
        c.setCompany(company);
        c.setStatus(status);
        c.setCreatedAt(LocalDate.now().minusDays(daysAgo));
        return customers.save(c);
    }

    private void deal(String title, String description, int amount, DealStage stage, Customer customer,
                      LocalDate created, LocalDate closed) {
        Deal d = new Deal();
        d.setTitle(title);
        d.setDescription(description);
        d.setAmount(BigDecimal.valueOf(amount));
        d.setStage(stage);
        d.setCustomer(customer);
        d.setCreatedAt(created);
        d.setClosedAt(closed);
        deals.save(d);
    }
}
