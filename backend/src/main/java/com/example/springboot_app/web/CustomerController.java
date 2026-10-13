package com.example.springboot_app.web;

import com.example.springboot_app.model.Customer;
import com.example.springboot_app.repository.CustomerRepository;
import com.example.springboot_app.repository.DealRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerRepository customers;
    private final DealRepository deals;

    public CustomerController(CustomerRepository customers, DealRepository deals) {
        this.customers = customers;
        this.deals = deals;
    }

    @GetMapping
    public List<Customer> list() {
        return customers.findAll();
    }

    @GetMapping("/{id}")
    public Customer get(@PathVariable Long id) {
        return customers.findById(id).orElseThrow(() -> new NotFoundException("Customer", id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Customer create(@RequestBody Customer body) {
        body.setId(null);
        return customers.save(body);
    }

    @PutMapping("/{id}")
    public Customer update(@PathVariable Long id, @RequestBody Customer body) {
        Customer c = get(id);
        c.setName(body.getName());
        c.setEmail(body.getEmail());
        c.setPhone(body.getPhone());
        c.setCompany(body.getCompany());
        c.setStatus(body.getStatus());
        return customers.save(c);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        if (deals.existsByCustomerId(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Customer still has deals");
        }
        customers.delete(get(id));
    }
}
