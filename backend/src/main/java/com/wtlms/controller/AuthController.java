package com.wtlms.controller;

import com.wtlms.dto.ApiResponse;
import com.wtlms.dto.AuthRequest;
import com.wtlms.dto.AuthResponse;
import com.wtlms.dto.RegisterRequest;
import com.wtlms.exception.BadRequestException;
import com.wtlms.model.Customer;
import com.wtlms.model.Role;
import com.wtlms.model.User;
import com.wtlms.repository.CustomerRepository;
import com.wtlms.repository.UserRepository;
import com.wtlms.security.JwtTokenProvider;
import com.wtlms.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Year;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthController(AuthenticationManager authenticationManager,
                          UserRepository userRepository,
                          CustomerRepository customerRepository,
                          PasswordEncoder passwordEncoder,
                          JwtTokenProvider tokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().trim(), request.getPassword())
        );

        String jwt = tokenProvider.generateToken(authentication);
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();

        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new BadRequestException("User record not found"));

        AuthResponse authResponse = new AuthResponse(
                jwt,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getPhone(),
                user.getOrganization(),
                user.getRole()
        );

        return ResponseEntity.ok(ApiResponse.ok("Login successful", authResponse));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().trim())) {
            throw new BadRequestException("An account with email " + request.getEmail() + " already exists");
        }

        Role assignedRole = request.getRole() != null ? request.getRole() : Role.ROLE_CUSTOMER;

        User user = new User(
                request.getEmail().trim(),
                passwordEncoder.encode(request.getPassword()),
                request.getFullName().trim(),
                request.getPhone(),
                request.getOrganization(),
                assignedRole
        );

        User savedUser = userRepository.save(user);

        // If customer, also create customer profile record
        if (assignedRole == Role.ROLE_CUSTOMER) {
            int year = Year.now().getValue();
            long count = customerRepository.count() + 1;
            String customerId = "CUST-" + year + "-" + String.format("%04d", count);
            Customer customer = new Customer(
                    customerId,
                    savedUser.getFullName(),
                    savedUser.getEmail(),
                    savedUser.getPhone(),
                    request.getAddress(),
                    savedUser.getOrganization(),
                    savedUser.getId()
            );
            customerRepository.save(customer);
        }

        String token = tokenProvider.generateTokenFromEmail(
                savedUser.getEmail(),
                savedUser.getId(),
                savedUser.getFullName(),
                savedUser.getRole().name()
        );

        AuthResponse response = new AuthResponse(
                token,
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getFullName(),
                savedUser.getPhone(),
                savedUser.getOrganization(),
                savedUser.getRole()
        );

        return ResponseEntity.ok(ApiResponse.ok("Registration successful", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthResponse>> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            throw new BadRequestException("Not authenticated");
        }

        User user = userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new BadRequestException("User not found"));

        AuthResponse response = new AuthResponse(
                null,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getPhone(),
                user.getOrganization(),
                user.getRole()
        );

        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
