package com.eazybytes.stocktrading.service;

import com.eazybytes.stocktrading.exception.InsufficientBalanceException;
import com.eazybytes.stocktrading.exception.StockNotFoundException;
import com.eazybytes.stocktrading.exception.UserNotFoundException;
import com.eazybytes.stocktrading.model.*;
import com.eazybytes.stocktrading.repository.OrderRepository;
import com.eazybytes.stocktrading.repository.StockRepository;
import com.eazybytes.stocktrading.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TradingService {

    private final UserRepository userRepository;
    private final StockRepository stockRepository;
    private final OrderRepository orderRepository;

    public TradeOrder executeTrade(OrderRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new UserNotFoundException(request.getUserId()));

        Stock stock = stockRepository.findById(request.getStockSymbol())
                .orElseThrow(() -> new StockNotFoundException(request.getStockSymbol()));

        validateTrade(user, stock, request);

        TradeOrder tradeOrder = new TradeOrder();
        tradeOrder.setUser(user);
        tradeOrder.setStock(stock);
        tradeOrder.setType(request.getType());
        tradeOrder.setQuantity(request.getQuantity());
        tradeOrder.setPrice(stock.getCurrentPrice());

        updateUserBalance(user, tradeOrder);

        return orderRepository.save(tradeOrder);
    }

    private void validateTrade(User user, Stock stock, OrderRequest request) {
        if (request.getType() == OrderType.BUY &&
                user.getVirtualBalance() < (stock.getCurrentPrice() * request.getQuantity())) {
            throw new InsufficientBalanceException();
        }
    }

    private TradeOrder createOrder(User user, Stock stock, OrderRequest request) {
        return TradeOrder.builder()
                .user(user)
                .stock(stock)
                .type(request.getType())
                .quantity(request.getQuantity())
                .price(stock.getCurrentPrice())
                .build();
    }

    private void updateUserBalance(User user, TradeOrder tradeOrder) {
        double amount = tradeOrder.getPrice() * tradeOrder.getQuantity();
        if (tradeOrder.getType() == OrderType.BUY) {
            user.setVirtualBalance(user.getVirtualBalance() - amount);
        } else {
            user.setVirtualBalance(user.getVirtualBalance() + amount);
        }
        userRepository.save(user);
    }

    // ✅ ADD THIS ↓
    public List<TradeOrder> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserIdOrderByTimestampDesc(userId);
    }
}
