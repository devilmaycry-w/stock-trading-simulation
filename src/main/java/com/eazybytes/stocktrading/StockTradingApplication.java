package com.eazybytes.stocktrading;

import com.eazybytes.stocktrading.model.Stock;
import com.eazybytes.stocktrading.model.User;
import com.eazybytes.stocktrading.repository.StockRepository;
import com.eazybytes.stocktrading.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class StockTradingApplication {

	public static void main(String[] args) {
		SpringApplication.run(StockTradingApplication.class, args);
	}

	@Bean
	CommandLineRunner initData(
			UserRepository userRepository,
			StockRepository stockRepository,
			PasswordEncoder passwordEncoder) {
		return args -> {
			// 1. Safe Admin User Creation
			if (!userRepository.existsByEmail("admin@example.com")) {
				User admin = User.builder()
						.email("admin@example.com")
						.password(passwordEncoder.encode("admin"))
						.virtualBalance(0.0)
						.role(User.Role.ADMIN)
						.build();
				userRepository.save(admin);
				System.out.println("Admin user created");
			}

			// 2. Idempotent Stock Seeding
			seedStock(stockRepository, "AAPL", "Apple Inc.", 150.0);
			seedStock(stockRepository, "GOOGL", "Alphabet Inc.", 2800.0);
			seedStock(stockRepository, "TSLA", "Tesla Inc.", 700.0);
		};
	}

	private void seedStock(StockRepository repository, String symbol, String name, double price) {
		repository.findById(symbol).ifPresentOrElse(
				existing -> System.out.println("Stock " + symbol + " already exists"),
				() -> {
					repository.save(new Stock(symbol, name, price, price - 5));
					System.out.println("Created stock: " + symbol);
				}
		);
	}
}