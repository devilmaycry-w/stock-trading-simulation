package com.eazybytes.stocktrading.controller;

import com.eazybytes.stocktrading.config.JwtUtils;
import com.eazybytes.stocktrading.model.User;
import com.eazybytes.stocktrading.repository.UserRepository;
import com.eazybytes.stocktrading.service.UserDetailsServiceImpl;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final UserDetailsServiceImpl userDetailsService;

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerUser(
            @RequestBody @Valid UserRegistrationRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Email already exists"));
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        User savedUser = userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "message", "User registered successfully",
                "userId", savedUser.getId()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @RequestBody @Valid LoginRequest request) {

        try {
            UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());

            if (!passwordEncoder.matches(request.getPassword(), userDetails.getPassword())) {
                throw new BadCredentialsException("Invalid credentials");
            }

            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Map<String, Object> response = new HashMap<>();
            response.put("token", jwtUtils.generateToken(userDetails));
            response.put("user", Map.of(
                    "id", user.getId(),
                    "email", user.getEmail()
            ));

            return ResponseEntity.ok(response);

        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Invalid email or password"));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Login failed: " + e.getMessage()));
        }
    }

    // ===== DTO Classes =====
    @Data
    public static class UserRegistrationRequest {
        @Email(message = "Invalid email format")
        @NotBlank(message = "Email cannot be blank")
        private String email;

        @Size(min = 8, message = "Password must be at least 8 characters")
        @NotBlank(message = "Password cannot be blank")
        private String password;
    }

    @Data
    public static class LoginRequest {
        @Email(message = "Invalid email format")
        @NotBlank(message = "Email cannot be blank")
        private String email;

        @NotBlank(message = "Password cannot be blank")
        private String password;
    }
}