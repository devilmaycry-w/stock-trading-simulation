package com.eazybytes.stocktrading.controller;

import com.eazybytes.stocktrading.model.TradeOrder;
import com.eazybytes.stocktrading.repository.StockRepository;
import com.eazybytes.stocktrading.repository.OrderRepository;
import com.eazybytes.stocktrading.model.OrderType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final OrderRepository orderRepository;
    private final StockRepository stockRepository;

    @GetMapping("/{userId}")
    public AnalyticsResponse getAnalytics(@PathVariable Long userId) {
        List<TradeOrder> orders = orderRepository.findByUserId(userId);

        double totalInvested = calculateTotalInvested(orders);
        double currentValue = calculateCurrentValue(orders);

        return new AnalyticsResponse(
                totalInvested,
                currentValue,
                calculatePercentageChange(totalInvested, currentValue)
        );
    }

    private double calculateTotalInvested(List<TradeOrder> orders) {
        return orders.stream()
                .filter(o -> o.getType() == OrderType.BUY)
                .mapToDouble(o -> o.getPrice() * o.getQuantity())
                .sum();
    }

    private double calculateCurrentValue(List<TradeOrder> orders) {
        return orders.stream()
                .collect(Collectors.groupingBy(
                        o -> o.getStock().getSymbol(),
                        Collectors.summingInt(o -> o.getType() == OrderType.BUY ? o.getQuantity() : -o.getQuantity())
                ))
                .entrySet().stream()
                .filter(e -> e.getValue() > 0)
                .mapToDouble(e -> e.getValue() * stockRepository.findById(e.getKey())
                        .orElseThrow().getCurrentPrice())
                .sum();
    }

    private double calculatePercentageChange(double invested, double current) {
        return ((current - invested) / invested) * 100;
    }

    @Data
    @AllArgsConstructor
    public static class AnalyticsResponse {
        private double totalInvested;
        private double currentValue;
        private double percentageChange;
    }
}