package com.example.springboot_app.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Getter
@Setter
public class Deal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String description;

    @Column(nullable = false)
    private BigDecimal amount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DealStage stage = DealStage.NEW;

    @ManyToOne(optional = false)
    private Customer customer;

    @Column(nullable = false)
    private LocalDate createdAt = LocalDate.now();

    /** Set when the deal reaches WON or LOST. */
    private LocalDate closedAt;
}
