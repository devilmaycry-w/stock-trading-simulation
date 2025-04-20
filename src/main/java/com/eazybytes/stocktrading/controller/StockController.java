package com.eazybytes.stocktrading.controller;

import com.eazybytes.stocktrading.model.Stock;
import com.eazybytes.stocktrading.model.StockDTO;
import com.eazybytes.stocktrading.service.StockService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stocks")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:63342", allowCredentials = "true")
public class StockController {
    private final StockService stockService;


    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")  // Only admins can add stocks
    public ResponseEntity<Stock> addStock(@RequestBody @Valid Stock stock) {
        return ResponseEntity.ok(stockService.addStock(stock));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<StockDTO>> getAllStocks(){
        List<StockDTO> dtoList = stockService.getAllStocks()
                .stream()
                .map(StockDTO::new)
                .toList();
        return ResponseEntity.ok(dtoList);
    }
}