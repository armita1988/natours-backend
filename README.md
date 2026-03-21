# Natours Backend

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Express](https://img.shields.io/badge/Express.js-Backend-black)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green)
![JWT](https://img.shields.io/badge/Auth-JWT-blue)

A **RESTful backend application** built with **Node.js, Express, and MongoDB** for a tour booking platform.  
This project demonstrates backend architecture, authentication, and scalable API design.

---

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt
- Nodemailer

---

## Features

- User authentication (signup & login)
- Password encryption with bcrypt
- Password reset functionality
- Role-based authorization
- CRUD operations for tours
- Filtering, sorting and pagination
- Centralized error handling
- MVC‑inspired modular architecture

---

## API Endpoints

| Method | Endpoint             | Description       | Auth Required |
| ------ | -------------------- | ----------------- | ------------- |
| GET    | /app/v1/tours        | Get all tours     | No            |
| GET    | /app/v1/tours/:id    | Get specific tour | No            |
| POST   | /app/v1/tours        | Create tour       | Yes           |
| PATCH  | /app/v1/tours/:id    | Update tour       | Yes           |
| DELETE | /app/v1/tours/:id    | Delete tour       | Yes           |
| POST   | /app/v1/users/signup | Register user     | No            |
| POST   | /app/v1/users/login  | Login user        | No            |

---

## Example Requests

Requests can be tested using **curl**, Postman, or any API client.

`curl` is a command‑line tool used to send HTTP requests from the terminal.

---

### Get All Tours

**Endpoint**

GET http://localhost:3000/app/v1/tours

**Example**

```bash
curl http://localhost:3000/app/v1/tours
```

---

### Get Single Tour

**Endpoint**

GET http://localhost:3000/app/v1/tours/:tourId

**Example**

```bash
curl http://localhost:3000/app/v1/tours/5c88fa8cf4afda39709c295d
```

---

### Login

**Endpoint**

POST http://localhost:3000/app/v1/users/login

**Request Body**

```json
{
  "email": "sophie@example.com",
  "password": "test1234"
}
```

**Example**

```bash
curl -X POST http://localhost:3000/app/v1/users/login -H "Content-Type: application/json" -d '{"email":"sophie@example.com","password":"test1234"}'
```

**Sample Response**

```json
{
  "status": "success",
  "token": "YOUR_JWT_TOKEN"
}
```

---

### Create Tour (Protected Route)

**Endpoint**

POST http://localhost:3000/app/v1/tours

**Request Body**

```json
{
  "name": "The Sea Explorer 2",
  "duration": 125,
  "maxGroupSize": 5,
  "difficulty": "easy",
  "price": 4736,
  "summary": "create a new test tour",
  "imageCover": "tour-1-cover.jpg"
}
```

**Example**

```bash
curl -X POST http://localhost:3000/app/v1/tours -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_JWT_TOKEN" -d '{
"name":"The Sea Explorer 2",
"duration":125,
"maxGroupSize":5,
"difficulty":"easy",
"price":4736,
"summary":"create a new test tour",
"imageCover":"tour-1-cover.jpg"
}'
```

---

## Architecture Overview

The project follows a **modular backend architecture inspired by the MVC pattern**.  
Since this project is a **REST API backend**, it does not include a view layer.

### Request Flow

```
Client Request
      ↓
Express Route
      ↓
Controller
      ↓
Middleware / Business Logic
      ↓
Mongoose Model
      ↓
MongoDB
      ↓
Response
```

### Layer Responsibilities

**Routes**  
Define API endpoints and map requests to controllers.

**Controllers**  
Handle request logic, validate input, and send responses.

**Models**  
Define Mongoose schemas and manage interaction with MongoDB.

**Middleware**  
Handle authentication, authorization, and centralized error handling.

---

## Authentication Flow (JWT)

Protected routes require a valid JWT token.

```
User Login
   ↓
Controller verifies credentials
   ↓
JWT token generated
   ↓
Token returned to client
   ↓
Client sends token in Authorization header
   ↓
Auth middleware verifies token
   ↓
Access granted to protected routes
```

Public routes such as **login, signup, and fetching tours** do not require authentication.

---

## Project Structure

```
natours-backend
│
├── controllers
├── models
├── routes
├── utils
├── dev-data
├── app.js
└── server.js
```

---

## Postman Collection

All endpoints can be tested using the included Postman collection:

`postman/Natours.postman_collection.json`

---

## Installation

Clone repository

```bash
git clone https://github.com/armita1988/natours-backend.git
```

Enter project folder

```bash
cd natours-backend
```

Install dependencies

```bash
npm install
```

---

## Configure Environment Variables

Rename the configuration file

```
config.env.example → config.env
```

Then replace placeholder values with real configuration:

```env
NODE_ENV=development
DATABASE_URL=your_database_url
DATABASE_PASSWORD=your_database_password
PORT=3000

JWT_SECRET=your_long_and_secure_jwt_secret
JWT_EXPIRES_IN=1d
JWT_COOKIE_EXPIRES_IN=90

EMAIL_USERNAME=your_email_username
EMAIL_PASSWORD=your_email_password
EMAIL_HOST=your_email_host
EMAIL_PORT=your_email_port
```

---

## Import Sample Data

Seed the database using development data located in:

```
dev-data/data/
```

Run:

```bash
node utils/insertRemoveData.js --import
```

This inserts:

- tours
- users
- reviews

---

## Remove Sample Data

```bash
node utils/insertRemoveData.js --delete
```

---

## Run the Server

Development mode

```bash
npm run dev
```

Production mode

```bash
npm start
```

Server runs at

```
http://localhost:3000
```

---

## Author

**Armita Haji Mani**  
Full‑Stack Developer

GitHub: https://github.com/armita1988
