package com.eazybytes.stocktrading.exception;

public class StockNotFoundException extends RuntimeException {
    public StockNotFoundException(String symbol) {
        super("Stock not found with symbol: " + symbol);
    }
}