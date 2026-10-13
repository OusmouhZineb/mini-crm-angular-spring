package com.example.springboot_app.web;

import com.example.springboot_app.dto.DealRequest;
import com.example.springboot_app.dto.DealResponse;
import com.example.springboot_app.model.Deal;
import com.example.springboot_app.model.DealStage;
import com.example.springboot_app.repository.CustomerRepository;
import com.example.springboot_app.repository.DealRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/deals")
public class DealController {

    private final DealRepository deals;
    private final CustomerRepository customers;

    public DealController(DealRepository deals, CustomerRepository customers) {
        this.deals = deals;
        this.customers = customers;
    }

    @GetMapping
    public List<DealResponse> list() {
        return deals.findAll().stream().map(DealResponse::from).toList();
    }

    @GetMapping("/{id}")
    public DealResponse get(@PathVariable Long id) {
        return DealResponse.from(find(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DealResponse create(@RequestBody DealRequest req) {
        Deal d = new Deal();
        apply(d, req);
        return DealResponse.from(deals.save(d));
    }

    @PutMapping("/{id}")
    public DealResponse update(@PathVariable Long id, @RequestBody DealRequest req) {
        Deal d = find(id);
        apply(d, req);
        return DealResponse.from(deals.save(d));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        deals.delete(find(id));
    }

    private Deal find(Long id) {
        return deals.findById(id).orElseThrow(() -> new NotFoundException("Deal", id));
    }

    private void apply(Deal d, DealRequest req) {
        d.setTitle(req.title());
        d.setDescription(req.description());
        d.setAmount(req.amount());
        d.setCustomer(customers.findById(req.customerId())
                .orElseThrow(() -> new NotFoundException("Customer", req.customerId())));
        DealStage stage = req.stage() == null ? DealStage.NEW : req.stage();
        d.setStage(stage);
        d.setClosedAt(stage.isOpen() ? null : (d.getClosedAt() != null ? d.getClosedAt() : LocalDate.now()));
    }
}
