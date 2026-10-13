package com.example.springboot_app.repository;

import com.example.springboot_app.model.Deal;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DealRepository extends JpaRepository<Deal, Long> {

    boolean existsByCustomerId(Long customerId);
}
