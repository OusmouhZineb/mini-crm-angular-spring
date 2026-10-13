# Mini CRM

A small CRM with an Angular front end and a Spring Boot API, with a UI based on a Figma dashboard design.

- **backend/**: Spring Boot 4, Java 21, Spring Data JPA, H2 in-memory database
- **frontend/**: Angular 17 (standalone components, signals)

Features: dashboard (revenue, pipeline and deals-won metrics, monthly revenue chart, new-customer donut, recent deals), customers CRUD, deals CRUD.

## Run

Backend (http://localhost:8080), needs JDK 21:

```bash
cd backend
./mvnw spring-boot:run
```

Frontend (http://localhost:4200), needs Node 18+:

```bash
cd frontend
npm install
npx ng serve
```

The database is in memory and is filled with demo data on every start.
