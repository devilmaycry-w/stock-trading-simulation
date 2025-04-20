package com.eazybytes.stocktrading.model;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @NoArgsConstructor @AllArgsConstructor
public class OrderRequest {

    @NotNull(message = "userid is required.")
    private Long userId;

    @NotBlank(message = "Stock symbol is required")
    private String stockSymbol;

    @NotNull(message = "TradeOrder type is required")
    private OrderType type;

    @NotNull
    @Positive(message = "Quantity must be positive")
    private Integer quantity;


    @Override
    public String toString() {
        return "OrderRequest{" +
                "userId=" + userId +
                ", stockSymbol='" + stockSymbol + '\'' +
                ", type=" + type +
                ", quantity=" + quantity +
                '}';
    }

}