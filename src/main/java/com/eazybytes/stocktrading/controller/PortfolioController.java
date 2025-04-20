package com.eazybytes.stocktrading.controller;

import com.eazybytes.stocktrading.model.TradeOrder;
import com.eazybytes.stocktrading.repository.OrderRepository;
import com.eazybytes.stocktrading.model.OrderType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class PortfolioController {

    private final OrderRepository orderRepository;

    @GetMapping("/{userId}/portfolio")
    public PortfolioResponse getPortfolio(@PathVariable Long userId) {
        List<TradeOrder> orders = orderRepository.findByUserId(userId);

        Map<String, PortfolioItem> holdings = orders.stream()
                .collect(Collectors.groupingBy(
                        order -> order.getStock().getSymbol(),
                        Collectors.collectingAndThen(
                                Collectors.toList(),
                                ordersList -> {
                                    int netQuantity = ordersList.stream()
                                            .mapToInt(o -> o.getType() == OrderType.BUY ? o.getQuantity() : -o.getQuantity())
                                            .sum();
                                    double avgPrice = ordersList.stream()
                                            .filter(o -> o.getType() == OrderType.BUY)
                                            .mapToDouble(o -> o.getPrice() * o.getQuantity())
                                            .sum() / (netQuantity > 0 ? netQuantity : 1);
                                    return new PortfolioItem(netQuantity, avgPrice);
                                }
                        )
                ));

        return new PortfolioResponse(holdings);
    }

    @Data
    @AllArgsConstructor
    public static class PortfolioResponse {
        private Map<String, PortfolioItem> holdings;
    }

    @Data
    @AllArgsConstructor
    public static class PortfolioItem {
        private int quantity;
        private double averagePrice;
    }
}