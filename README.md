Stock Trading Simulator
A web-based stock trading simulator built for the EazyByts internship demo, allowing users to practice trading stocks in a risk-free environment. The application features user authentication, real-time stock data, portfolio management, watchlists, and interactive charts, all secured with JWT-based authentication and styled with a modern, responsive UI.
Features

User Authentication: Secure signup and login with JWT, ensuring only authorized users access the platform.
Stock Dashboard: View real-time stock prices, historical data, and market trends with interactive Chart.js visualizations.
Portfolio Management: Track holdings, monitor profit/loss, and manage cash balance.
Trading System: Place buy/sell orders with instant updates to portfolio and cash.
Watchlist: Add/remove stocks to monitor favorite assets.
Responsive Design: Mobile-friendly UI built with Tailwind CSS for seamless access on desktop and mobile.
Demo Mode: Explore features without registration using mock data.
Public Access: Live demo via ngrok for evaluators to test the app.

Technologies

Backend: Spring Boot, Spring Security, Spring Data JPA, MySQL
Frontend: HTML, JavaScript (vanilla), Tailwind CSS, Chart.js
Authentication: JWT for secure user sessions
Database: MySQL for storing users, stocks, and portfolios
Deployment: Ngrok for public access, Maven for build
Tools: IntelliJ IDEA, Postman, Git, Node.js (for Tailwind CSS)

Project Structure
stock-trading/
├── src/
│   ├── main/
│   │   ├── java/com/eazybytes/stocktrading/
│   │   │   ├── config/          # SecurityConfig, JwtUtils, WebConfig
│   │   │   ├── controller/      # AuthController, StockController, PortfolioController
│   │   │   ├── entity/         # User, Stock entities
│   │   │   ├── repository/     # UserRepository, StockRepository
│   │   │   ├── service/        # UserDetailsServiceImpl
│   │   ├── resources/
│   │       ├── static/         # app.js, signup.html, login.html, index.html, tailwind.css
│   │       ├── application.properties # MySQL config
├── pom.xml                     # Maven dependencies
├── tailwind.config.js          # Tailwind CSS configuration
└── README.md

Setup Instructions
Prerequisites

Java 17
Maven 3.9.9
MySQL 8.0
Node.js 18.20.8 (for Tailwind CSS)
Ngrok (for public demo)

Installation

Clone the Repository:
git clone https://github.com/your-username/stock-trading-simulator.git
cd stock-trading-simulator


Set Up MySQL:

Create a database:
CREATE DATABASE stock_trading_db;


Update src/main/resources/application.properties:
spring.datasource.url=jdbc:mysql://localhost:3306/stock_trading_db?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=your_mysql_password
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
server.port=8080




Build the Project:
mvn clean install


Run Tailwind CSS:
npx tailwindcss -i ./src/main/resources/static/input.css -o ./src/main/resources/static/tailwind.css --watch


Run the Application:
java -jar target/stock-trading-simulator-1.0-SNAPSHOT.jar


Expose with Ngrok:
ngrok http 8080


Access at https://<ngrok-id>.ngrok-free.app.


Access the App:

Open http://localhost:8080 or ngrok URL.
Sign up at /signup.html or log in at /login.html (e.g., demo:demo123).



Demo

Live Demo: https://403d-103-206-137-166.ngrok-free.app (Contact for credentials)
Screencast: Watch on Google Drive
Credentials: Use demo:demo123 or sign up for a new account.

Screenshots
Dashboard
Signup
Challenges and Solutions

JWT Authentication: Implemented secure login/signup with Spring Security and JWT, resolving mobile browser issues by handling localStorage restrictions.
CORS: Configured SecurityConfig.java to allow ngrok and localhost origins, fixing API errors (SyntaxError: Unexpected token '<').
Registration: Fixed 400 Bad Request in signup.html by ensuring correct JSON payloads and adding backend validation for duplicate usernames/emails.
Responsive UI: Used Tailwind CSS to make signup.html, login.html, and dashboard mobile-friendly.

Future Improvements

Add real-time stock price updates via WebSocket.
Integrate a third-party stock API (e.g., Alpha Vantage).
Enhance portfolio analytics with advanced metrics.
Implement password recovery and user profile management.

Contributing
Contributions are welcome! Please fork the repository, create a feature branch, and submit a pull request.
Contact

Email: realankrit@gmail.com


Built with 💻 for the EazyByts internship demo, April 2025.
