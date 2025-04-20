FROM maven:3.8.6-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests
RUN ls -l /app/target/
FROM eclipse-temurin:17-jdk-alpine
VOLUME /tmp
WORKDIR /app
COPY --from=builder /app/target/stock-trading-simulator-1.0-SNAPSHOT.jar app.jar
RUN ls -l /app/ || echo "Runtime app directory not found"
RUN test -f /app/app.jar || echo "app.jar not found in runtime"
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]