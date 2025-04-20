package com.eazybytes.stocktrading.controller;

import com.eazybytes.stocktrading.model.TradeOrder;
import com.eazybytes.stocktrading.model.OrderRequest;
import com.eazybytes.stocktrading.service.TradingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/trade")
@RequiredArgsConstructor
public class TradingController {
    private final TradingService tradingService;

    @PostMapping
    public ResponseEntity<TradeOrder> executeTrade(@RequestBody @Valid OrderRequest request) {
        return ResponseEntity.ok(tradingService.executeTrade(request));
    }
}