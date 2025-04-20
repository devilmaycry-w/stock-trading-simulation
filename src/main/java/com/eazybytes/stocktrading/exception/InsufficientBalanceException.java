package com.eazybytes.stocktrading.exception;

public class InsufficientBalanceException extends RuntimeException {
    public InsufficientBalanceException() {
        super("Insufficient balance for this transaction");
    }

    public InsufficientBalanceException(String message) {
        super(message);
    }
}