FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build
COPY pom.xml .
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 mvn -B -ntp package

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S archive && adduser -S -G archive archive
COPY --from=build /build/target/archive-api.jar ./archive-api.jar
USER archive
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "archive-api.jar"]
