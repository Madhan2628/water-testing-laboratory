package com.wtlms.controller;

import com.wtlms.dto.ApiResponse;
import com.wtlms.dto.RegisterRequest;
import com.wtlms.exception.BadRequestException;
import com.wtlms.exception.ResourceNotFoundException;
import com.wtlms.model.Role;
import com.wtlms.model.User;
import com.wtlms.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        List<User> users = userRepository.findAll();
        // Hide hashed passwords in response
        users.forEach(u -> u.setPassword(null));
        return ResponseEntity.ok(ApiResponse.ok(users));
    }

    @GetMapping("/staff")
    @PreAuthorize("hasAnyRole('ADMIN', 'LABORATORY_STAFF')")
    public ResponseEntity<ApiResponse<List<User>>> getStaffUsers() {
        List<User> staff = userRepository.findByRole(Role.ROLE_LABORATORY_STAFF);
        staff.forEach(u -> u.setPassword(null));
        return ResponseEntity.ok(ApiResponse.ok(staff));
    }

    @PostMapping("/staff")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<User>> createStaffUser(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().trim())) {
            throw new BadRequestException("User with email " + request.getEmail() + " already exists");
        }

        User staff = new User(
                request.getEmail().trim(),
                passwordEncoder.encode(request.getPassword()),
                request.getFullName().trim(),
                request.getPhone(),
                request.getOrganization() != null ? request.getOrganization() : "Laboratory Testing Division",
                Role.ROLE_LABORATORY_STAFF
        );

        User saved = userRepository.save(staff);
        saved.setPassword(null);
        return ResponseEntity.ok(ApiResponse.ok("Staff member registered successfully", saved));
    }

    @PatchMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<User>> toggleUserStatus(@PathVariable String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        user.setActive(!user.isActive());
        User saved = userRepository.save(user);
        saved.setPassword(null);
        return ResponseEntity.ok(ApiResponse.ok("User status updated", saved));
    }
}
