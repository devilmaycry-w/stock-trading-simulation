package com.eazybytes.stocktrading.controller;

import com.eazybytes.stocktrading.model.OrderRequest;
import com.eazybytes.stocktrading.model.OrderType;
import com.eazybytes.stocktrading.model.TradeOrder;
import com.eazybytes.stocktrading.model.User;
import com.eazybytes.stocktrading.service.TradingService;
import com.eazybytes.stocktrading.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class TradeOrderController {

    private final TradingService tradingService;
    private final UserRepository userRepository;

    // ✅ Create Order (Delegates to TradingService)
    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest request, Principal principal) {

        // 1. Validate quantity
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            return ResponseEntity.badRequest().body("Quantity must be > 0");
        }

        // 2. Get user from token
        String email = principal.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // 3. Set userId in request
        request.setUserId(user.getId());

        // 4. Delegate to service layer
        TradeOrder savedOrder = tradingService.executeTrade(request);

        return ResponseEntity.ok(savedOrder);
    }

    // ✅ Secure order history: only logged-in user can access their own orders
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getOrderHistory(@PathVariable Long userId, Principal principal) {
        String email = principal.getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (!currentUser.getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied");
        }

        List<TradeOrder> orders = tradingService.getOrdersByUserId(userId);
        List<TradeOrderResponse> response = orders.stream().map(this::convertToResponse).toList();

        return ResponseEntity.ok(response);
    }

    // ✅ Convert entity to response DTO
    private TradeOrderResponse convertToResponse(TradeOrder order) {
        return new TradeOrderResponse(
                order.getId(),
                order.getStock().getSymbol(),
                order.getType(),
                order.getQuantity(),
                order.getPrice(),
                order.getTimestamp()
        );
    }

    // ✅ Response DTO
    @Data
    @AllArgsConstructor
    public static class TradeOrderResponse {
        private Long id;
        private String stockSymbol;
        private OrderType type;
        private Integer quantity;
        private Double price;
        private LocalDateTime timestamp;
    }
}
