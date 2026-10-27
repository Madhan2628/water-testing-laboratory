package com.wtlms.controller;

import com.wtlms.dto.ApiResponse;
import com.wtlms.model.Customer;
import com.wtlms.security.UserPrincipal;
import com.wtlms.service.CustomerService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LABORATORY_STAFF')")
    public ResponseEntity<ApiResponse<List<Customer>>> getAllCustomers(
            @RequestParam(required = false) String search) {
        List<Customer> list = customerService.getAllCustomers(search);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LABORATORY_STAFF')")
    public ResponseEntity<ApiResponse<Customer>> getCustomerById(@PathVariable String id) {
        Customer c = customerService.getCustomerById(id);
        return ResponseEntity.ok(ApiResponse.ok(c));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LABORATORY_STAFF')")
    public ResponseEntity<ApiResponse<Customer>> createCustomer(
            @RequestBody Customer customer,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Customer created = customerService.createCustomer(customer, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Customer registered successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LABORATORY_STAFF')")
    public ResponseEntity<ApiResponse<Customer>> updateCustomer(
            @PathVariable String id,
            @RequestBody Customer customer,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Customer updated = customerService.updateCustomer(id, customer, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Customer updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCustomer(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        customerService.deleteCustomer(id, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Customer deleted successfully", null));
    }
}
