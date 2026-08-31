# ==========================================
# Stage 1: Build the Spring Boot application
# ==========================================
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
# Pre-fetch dependencies to build faster on re-runs
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

# ==========================================
# Stage 2: Runtime image with Java + Python
# ==========================================
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Install Python 3, pip, and clean package cache
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Install curl_cffi python package globally
RUN pip3 install --no-cache-dir curl-cffi

# Copy the built jar from build stage
COPY --from=build /app/target/*.jar app.jar

# Expose the default Spring Boot port
EXPOSE 8080

# Start the application
ENTRYPOINT ["java", "-jar", "app.jar"]