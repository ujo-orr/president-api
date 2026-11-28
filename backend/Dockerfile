FROM python:3.13-slim AS archive-data
WORKDIR /data
COPY data/ ./
RUN python -B prepare_presidency_archive.py --sql /tmp/R__sync_presidency_archive.sql
RUN python -B prepare_public_events.py --sql /tmp/R__sync_public_events.sql
RUN python -B prepare_related_cases.py --sql /tmp/R__sync_related_cases.sql

FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build
COPY backend/pom.xml .
COPY backend/src ./src
COPY --from=archive-data /tmp/R__sync_presidency_archive.sql ./src/main/resources/db/migration/
COPY --from=archive-data /tmp/R__sync_public_events.sql ./src/main/resources/db/migration/
COPY --from=archive-data /tmp/R__sync_related_cases.sql ./src/main/resources/db/migration/
RUN --mount=type=cache,target=/root/.m2 mvn -B -ntp package

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S archive && adduser -S -G archive archive
COPY --from=build /build/target/archive-api.jar ./archive-api.jar
USER archive
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "archive-api.jar"]
