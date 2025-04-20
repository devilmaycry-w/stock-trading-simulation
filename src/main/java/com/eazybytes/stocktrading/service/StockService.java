package com.eazybytes.stocktrading.service;

import com.eazybytes.stocktrading.exception.StockNotFoundException;
import com.eazybytes.stocktrading.model.Stock;
import com.eazybytes.stocktrading.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StockService {
    private final StockRepository stockRepository;

    public List<Stock> getAllStocks() {
        return stockRepository.findAll();
    }

    public Stock addStock(Stock stock) {  // Add this method
        return stockRepository.save(stock);
    }

    public Stock updateStockPrice(String symbol, Double newPrice) {
        Stock stock = stockRepository.findById(symbol)
                .orElseThrow(() -> new StockNotFoundException(symbol));
        stock.setCurrentPrice(newPrice);
        return stockRepository.save(stock);
    }
}