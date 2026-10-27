package com.wtlms.service;

import com.wtlms.exception.BadRequestException;
import com.wtlms.exception.ResourceNotFoundException;
import com.wtlms.model.Customer;
import com.wtlms.repository.CustomerRepository;
import com.wtlms.security.UserPrincipal;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public synchronized String generateCustomerId() {
        int currentYear = Year.now().getValue();
        String prefix = "CUST-" + currentYear + "-";
        long count = customerRepository.count() + 1;
        String idStr = prefix + String.format("%04d", count);
        while (customerRepository.existsByCustomerId(idStr)) {
            count++;
            idStr = prefix + String.format("%04d", count);
        }
        return idStr;
    }

    public List<Customer> getAllCustomers(String search) {
        List<Customer> all = customerRepository.findAll();
        if (search == null || search.isBlank()) {
            return all;
        }
        String q = search.toLowerCase();
        return all.stream()
                .filter(c -> (c.getName() != null && c.getName().toLowerCase().contains(q)) ||
                        (c.getEmail() != null && c.getEmail().toLowerCase().contains(q)) ||
                        (c.getCustomerId() != null && c.getCustomerId().toLowerCase().contains(q)) ||
                        (c.getOrganization() != null && c.getOrganization().toLowerCase().contains(q)))
                .collect(Collectors.toList());
    }

    public Customer getCustomerById(String id) {
        return customerRepository.findById(id)
                .or(() -> customerRepository.findByCustomerId(id))
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
    }

    public Customer createCustomer(Customer customer, UserPrincipal currentUser) {
        if (customer.getEmail() != null && customerRepository.existsByEmail(customer.getEmail())) {
            throw new BadRequestException("Customer with email " + customer.getEmail() + " already exists");
        }
        if (customer.getCustomerId() == null || customer.getCustomerId().isBlank()) {
            customer.setCustomerId(generateCustomerId());
        }
        customer.setRegistrationDate(LocalDateTime.now());
        return customerRepository.save(customer);
    }

    public Customer updateCustomer(String id, Customer updated, UserPrincipal currentUser) {
        Customer c = getCustomerById(id);
        if (updated.getName() != null) c.setName(updated.getName());
        if (updated.getPhone() != null) c.setPhone(updated.getPhone());
        if (updated.getAddress() != null) c.setAddress(updated.getAddress());
        if (updated.getOrganization() != null) c.setOrganization(updated.getOrganization());
        return customerRepository.save(c);
    }

    public void deleteCustomer(String id, UserPrincipal currentUser) {
        Customer c = getCustomerById(id);
        customerRepository.delete(c);
    }
}
