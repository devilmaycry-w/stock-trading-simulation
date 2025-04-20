package com.eazybytes.stocktrading.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data @NoArgsConstructor @AllArgsConstructor
public class Stock {
    @Id
    private String symbol;
    private String name;
    private double currentPrice;
    private double prevClose;
}
