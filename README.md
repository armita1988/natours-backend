# Natours API

A production-style RESTful API for a tour booking platform, built with **Node.js**, **Express.js**, **MongoDB**, and **Mongoose**.

This project was implemented as a full backend application with a strong focus on clean architecture, secure authentication, database modeling, reusable API patterns, and production-oriented Express practices.

It provides a complete backend foundation for a modern tours platform, including user management, authentication, tours, reviews, query features, and robust error handling.

---

## Live Status

This API is designed to be deployed as a standalone backend service and connected to a separate frontend client (React-based frontend plannedپ).

---

## Tech Stack

- **Node.js**
- **Express.js**
- **MongoDB Atlas**
- **Mongoose**
- **JWT Authentication**
- **bcryptjs**
- **dotenv**
- **slugify**
- **validator**
- **cookie-parser**
- **cors**
- **helmet**
- **express-rate-limit**
- **express-mongo-sanitize**
- **xss-clean**
- **hpp**

---

## Main Features

### Core API Capabilities

- RESTful API design
- Modular MVC architecture
- Tours, Users, Reviews resources
- Nested routes
- Middleware-based request flow
- Reusable query utility patterns

### Authentication & Authorization

- User signup / login
- JWT-based authentication
- Protected routes
- Role-based authorization
- Secure password hashing
- Authentication cookies / token handling
- Password update flow

### Advanced Query Features

- Filtering
- Sorting
- Field limiting
- Pagination

### Data Modeling

- Mongoose schemas and validation
- Document relationships using references
- Populate and virtual populate
- Embedded geo-location subdocuments
- Model middleware

### Security & Production Practices

- Global error handling
- Async error wrapper pattern
- Input sanitization
- Security headers
- Rate limiting
- Centralized environment configuration
- Graceful handling of unhandled rejections and uncaught exceptions

---

## Project Structure

```bash
natours-api/
│
├── controllers/        # Route handlers / business logic
├── models/             # Mongoose schemas and models
├── routes/             # Express route definitions
├── utils/              # Reusable utilities (API features, AppError, catchAsync, etc.)
├── dev-data/           # Seed/import JSON data
├── public/             # Static assets
│
├── app.js              # Express app configuration
├── server.js           # App bootstrap, DB connection, process-level error handling
├── config.example.env  # Environment variable template
└── package.json
```
