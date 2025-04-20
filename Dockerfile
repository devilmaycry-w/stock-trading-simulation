FROM maven:3.8.6-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests
FROM eclipse-temurin:17-jre-alpine
VOLUME /tmp
WORKDIR /app
COPY --from=builder /app/target/stock-trading-simulator-1.0-SNAPSHOT.jar app.jar
RUN chmod +x /app/app.jar
RUN ls -l /app/
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]