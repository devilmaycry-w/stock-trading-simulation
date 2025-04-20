package com.eazybytes.stocktrading.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Builder;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "trade_orders")
public class TradeOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_symbol", nullable = false)
    private Stock stock;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderType type;  // Changed from String to enum

    @Column(nullable = false)
    @Positive(message = "Quantity must be positive")
    private Integer quantity;

    @Column(nullable = false)
    @Positive(message = "Price must be positive")
    private Double price;

    @Column(nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

}