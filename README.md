# Library Management System

A full-stack web application for managing a library's books, members and lending. It has a Spring Boot REST API backed by MySQL and a responsive React admin dashboard.

## Features
- **Books:** add, edit and delete books, search by title, filter by category, and see available copies
- **Members:** register, edit and delete members, and search by name
- **Issue / Return:** pick a member and a book from dropdowns filled from the database, with automatic stock updates
- **Business rules:** no issuing when no copies are left, no returning the same transaction twice, issue and due date validation, and no deleting books or members that are still in use
- **Dashboard:** total books, total members, currently issued books, available copies and recent transactions
- **Transaction history:** search, status filter and an overdue label

## Tech Stack
- **Backend:** Java 17, Spring Boot, Spring Data JPA, Hibernate, Maven
- **Frontend:** React, Vite, Axios, React Router, CSS
- **Database:** MySQL

## Architecture
The backend follows Controller → Service → Repository → Database. Request validation and a global exception handler return clear 400, 404 and 409 responses. Issue and return run inside database transactions, with a row lock on the book so two requests can't take the last copy at the same time.
