---

# 📈 Stock Trading Simulator

A **web-based stock trading simulator** built for the **EazyByts internship demo**, enabling users to practice stock trading in a risk-free environment.

---

## 🚀 Features

- 🔐 **User Authentication**: Secure signup & login using **JWT**.
- 📊 **Stock Dashboard**: Real-time prices, historical data & **Chart.js** visualizations.
- 💼 **Portfolio Management**: Track holdings, monitor profit/loss & cash balance.
- 🛒 **Trading System**: Buy/Sell stocks with instant updates.
- ⭐ **Watchlist**: Add/remove favorite stocks.
- 📱 **Responsive Design**: Tailwind CSS-powered mobile-friendly UI.
- 🎮 **Demo Mode**: Explore app with mock data — no sign-up required!
- 🌐 **Public Access**: Live demo via **Ngrok**.

---

## 🛠️ Technologies Used

- **Backend**: Spring Boot, Spring Security, Spring Data JPA, MySQL  
- **Frontend**: HTML, Vanilla JS, Tailwind CSS, Chart.js  
- **Authentication**: JWT  
- **Database**: MySQL  
- **Deployment**: Ngrok, Maven  
- **Tools**: IntelliJ IDEA, Postman, Git, Node.js (Tailwind)

---

## 📂 Project Structure

```
stock-trading/
├── src/
│   ├── main/
│   │   ├── java/com/eazybytes/stocktrading/
│   │   │   ├── config/          # SecurityConfig, JwtUtils, WebConfig
│   │   │   ├── controller/      # AuthController, StockController, PortfolioController
│   │   │   ├── entity/          # User, Stock entities
│   │   │   ├── repository/      # UserRepository, StockRepository
│   │   │   ├── service/         # UserDetailsServiceImpl
│   ├── resources/
│       ├── static/              # app.js, signup.html, login.html, index.html, tailwind.css
│       ├── application.properties # MySQL config
├── pom.xml                      # Maven dependencies
├── tailwind.config.js          # Tailwind CSS configuration
└── README.md
```

---

## 🧑‍💻 Setup Instructions

### ✅ Prerequisites

- Java 17  
- Maven 3.9.9  
- MySQL 8.0  
- Node.js 18.20.8 (for Tailwind CSS)  
- Ngrok  

---

### 🔧 Installation Steps

1. **Clone the Repo**:
   ```bash
   git clone https://github.com/your-username/stock-trading-simulator.git
   cd stock-trading-simulator
   ```

2. **Set Up MySQL**:
   ```sql
   CREATE DATABASE stock_trading_db;
   ```

3. **Update `application.properties`**:
   ```
   spring.datasource.url=jdbc:mysql://localhost:3306/stock_trading_db?useSSL=false&serverTimezone=UTC
   spring.datasource.username=root
   spring.datasource.password=your_mysql_password
   spring.jpa.hibernate.ddl-auto=update
   spring.jpa.show-sql=true
   spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
   server.port=8080
   ```

4. **Build the Project**:
   ```bash
   mvn clean install
   ```
   
5. **Run the App**:
   ```bash
   java -jar target/stock-trading-simulator-1.0-SNAPSHOT.jar
   ```

6. **Expose Locally with Ngrok**:
   ```bash
   ngrok http 8080
   ```

---

## 🌍 Access the App

- 🔗 Local: `http://localhost:8080`  
- 🔗 Public: `https://<ngrok-id>.ngrok-free.app`  
- 📝 **Sign up**: `/signup.html`  
- 🔐 **Login**: `/login.html`  

---

## 🎥 Demo

- 🌐 **Live Demo**:- the live link is only available upto 2 hours.
- 🎬 **Screencast**: Watch on Google Drive  
- 👤 **Credentials**: `demo:demo123` (or create your own)

---

## 🧠 Challenges & Solutions

- ✅ **JWT Auth**: Secured mobile login with Spring Security + JWT  
- 🌐 **CORS Errors**: Fixed via `SecurityConfig.java` for Ngrok/localhost  
- 🛑 **Signup 400 Errors**: Fixed JSON issues & added duplicate validation  
- 📱 **Responsive UI**: Tailwind CSS used for mobile optimization

---

## 🌱 Future Improvements

- 🔄 Real-time stock updates via WebSocket  
- 📉 Integrate with APIs like Alpha Vantage  
- 📈 Advanced portfolio analytics  
- 🔐 Password recovery & profile management

---

## 🤝 Contributing

- Fork 📌 → Branch 🔧 → PR 🚀

---

## 📬 Contact 
- 📧 Email: realankrit@gmail.com  

---

🛠️ **Built with ❤️ for the EazyByts Internship Demo - April 2025**
