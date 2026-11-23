# Library Management System

Full-stack library app: Spring Boot REST API + MySQL backend, React (Vite) admin dashboard.

![Dashboard](docs/screenshots/dashboard.png)

## Features
- **Books:** add, edit, delete, search by title, filter by category, view available copies
- **Members:** register, edit, delete, search by name
- **Issue / Return:** member and book dropdowns loaded from MySQL, with automatic stock updates
- **Dashboard and history:** totals, recent transactions, status filter, overdue label

**Rules enforced by the backend:** no issuing when stock is 0, no returning the same transaction twice, issue/due date validation, and duplicate ISBN or email rejection.

## Tech Stack
Java 17, Spring Boot, Spring Data JPA, Hibernate, Maven · React, Vite, Axios · MySQL 8

## Architecture
React → Controller → Service → Repository → MySQL. DTOs carry validation, a global exception handler returns clean 400/404/409 errors, and issue/return run in `@Transactional` with a row lock on the book so concurrent requests can't take the last copy.

## Run Locally
**Prerequisites:** Java 17+, Node 18+, MySQL 8

1. Create the database: `CREATE DATABASE library_db;`
2. Copy `backend/src/main/resources/application.properties.example` to `application.properties` and set your MySQL password.
3. Backend (port 8080):
   ```
   cd backend
   mvn spring-boot:run
   ```
4. Frontend (port 5173), in a second terminal:
   ```
   cd frontend
   npm install
   npm run dev
   ```
5. Open http://localhost:5173

## API
Base URL `http://localhost:8080/api`

| Resource | Endpoints |
|---|---|
| Books | `GET /books?title=&category=`, `GET/PUT/DELETE /books/{id}`, `POST /books` |
| Members | `GET /members?name=`, `GET/PUT/DELETE /members/{id}`, `POST /members` |
| Transactions | `POST /transactions/issue`, `PUT /transactions/{id}/return`, `GET /transactions`, `GET /transactions/active` |
| Dashboard | `GET /dashboard` |

## How I Built This
I used AI assistance for scaffolding and code generation, working in small steps. I ran every step myself and tested all endpoints in Postman (including error cases) and every page in the UI.

## Known Limitations
No automated tests yet, no pagination, and `ddl-auto=update` instead of migrations. Authentication was out of scope.
