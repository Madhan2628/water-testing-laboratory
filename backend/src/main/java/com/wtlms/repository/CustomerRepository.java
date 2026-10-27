package com.wtlms.repository;

import com.wtlms.model.Customer;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends MongoRepository<Customer, String> {
    Optional<Customer> findByCustomerId(String customerId);
    Optional<Customer> findByEmail(String email);
    Optional<Customer> findByUserId(String userId);
    boolean existsByCustomerId(String customerId);
    boolean existsByEmail(String email);
}
