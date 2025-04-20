package com.eazybytes.stocktrading.repository;

import com.eazybytes.stocktrading.model.TradeOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<TradeOrder, Long> {
    List<TradeOrder> findByUserId(Long userId);
    List<TradeOrder> findByUserIdOrderByTimestampDesc(Long userId);
}
