# Stage 1: Build backend
FROM gradle:8-jdk21 AS backend-build
WORKDIR /app
COPY backend/ .
RUN gradle shadowJar --no-daemon

# Stage 2: Build frontend
FROM node:22-slim AS frontend-build
RUN corepack enable
WORKDIR /app
COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY frontend/ .
RUN pnpm build

# Stage 3: Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=backend-build /app/build/libs/*-all.jar app.jar
COPY --from=frontend-build /app/dist/ public/
EXPOSE 8989 9090
ENTRYPOINT ["java", "-jar", "app.jar"]
