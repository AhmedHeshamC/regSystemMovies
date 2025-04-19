# Movie Reservation System - System Design

## 1. Overview

This document outlines the system design for the Movie Reservation System backend. It covers the database schema, API endpoints, core logic, and technology stack choices, focusing on development aspects. The goal is to provide a blueprint for implementing the application.

## 2. Technology Stack

*   **Backend Framework:** Node.js with Express.js
*   **Database:** MySQL (Version 8.0.16+ recommended for CHECK constraints)
*   **ORM:** Sequelize
*   **Authentication:** JWT (JSON Web Tokens) using libraries like `jsonwebtoken`. Password hashing using `bcrypt`.
*   **Validation Library:** Joi or express-validator (Choose one or use as needed).
*   **Security Middleware:** Helmet

## 3. Database Schema

The database schema is defined in `schema.sql` (MySQL syntax). It establishes the structure for storing information about users, roles, movies, genres, theaters, seats, showtimes, and reservations.

**Key Features:**

*   **Tables:** `roles`, `users`, `genres`, `movies`, `theaters`, `seats`, `showtimes`, `reservations`, `reserved_seats`.
*   **Relationships:** Defined using Foreign Keys with appropriate `ON DELETE` actions (e.g., `CASCADE`, `SET NULL`, `RESTRICT`).
*   **Constraints:** `PRIMARY KEY`, `UNIQUE KEY`, `NOT NULL`, `CHECK` constraints enforce data integrity.
*   **Indexing:** Indexes are created on foreign keys and frequently queried columns for performance.
*   **Timestamps:** `created_at` and `updated_at` (with automatic updates) track record modifications.
*   **Database Name:** `mov_reserv_system`

**Core Entities (Summary):**

*   **`roles`**: Defines user roles ('admin', 'user').
*   **`users`**: Stores user credentials and links to a role.
*   **`genres`**: Movie categories.
*   **`movies`**: Movie details, linked to a genre.
*   **`theaters`**: Physical screens/locations with total seat capacity.
*   **`seats`**: Individual seat definitions within a theater.
*   **`showtimes`**: Specific movie screenings linked to a movie, theater, and time.
*   **`reservations`**: User bookings for a specific showtime.
*   **`reserved_seats`**: Junction table linking specific seats to a reservation.

*(Refer to `schema.sql` for complete details, data types, and constraints.)*

## 4. API Design (RESTful)

All endpoints require appropriate authentication (JWT Bearer Token in Authorization header) unless marked as Public. Admin endpoints require a user with the 'admin' role.

---

### 4.1 Authentication (`/auth`)

*   **`POST /signup`** (Public)
    *   **Description:** Registers a new user with the default 'user' role.
    *   **Request Body:** `{ "username": "string", "password": "string" }`
    *   **Success Response (201):** `{ "id": int, "username": "string", "role": "user" }`
    *   **Error Responses:** 400 (Validation), 409 (Username exists)
*   **`POST /login`** (Public)
    *   **Description:** Authenticates a user and returns a JWT.
    *   **Request Body:** `{ "username": "string", "password": "string" }`
    *   **Success Response (200):** `{ "token": "jwt_string" }`
    *   **Error Responses:** 401 (Invalid credentials)
*   **`POST /logout`** (Authenticated)
    *   **Description:** Invalidates the current session (if using a blocklist) or instructs client to discard token.
    *   **Success Response (200/204):** `{ "message": "Logged out successfully" }` or No Content.

---

### 4.2 Users (`/users`)

*   **`GET /users`** (Admin)
    *   **Description:** Lists all users.
    *   **Success Response (200):** `[{ "id": int, "username": "string", "role": "string" }, ...]`
*   **`PUT /users/{userId}/promote`** (Admin)
    *   **Description:** Promotes a user to the 'admin' role.
    *   **Success Response (200):** `{ "message": "User promoted to admin" }`
    *   **Error Responses:** 404 (User not found)

---

### 4.3 Genres (`/genres`)

*   **`POST /genres`** (Admin)
    *   **Description:** Creates a new genre.
    *   **Request Body:** `{ "name": "string" }`
    *   **Success Response (201):** `{ "id": int, "name": "string" }`
    *   **Error Responses:** 400, 409 (Name exists)
*   **`GET /genres`** (Public)
    *   **Description:** Lists all genres.
    *   **Success Response (200):** `[{ "id": int, "name": "string" }, ...]`
*   **`PUT /genres/{genreId}`** (Admin)
    *   **Description:** Updates an existing genre.
    *   **Request Body:** `{ "name": "string" }`
    *   **Success Response (200):** `{ "id": int, "name": "string" }`
    *   **Error Responses:** 400, 404, 409
*   **`DELETE /genres/{genreId}`** (Admin)
    *   **Description:** Deletes a genre.
    *   **Success Response (204):** No Content.
    *   **Error Responses:** 404

---

### 4.4 Movies (`/movies`)

*   **`POST /movies`** (Admin)
    *   **Description:** Adds a new movie.
    *   **Request Body:** `{ "title": "string", "description": "string", "poster_image_url": "string", "genre_id": int }`
    *   **Success Response (201):** `{ "id": int, "title": ..., "genre_id": ... }`
    *   **Error Responses:** 400
*   **`GET /movies`** (Public)
    *   **Description:** Lists all movies, optionally filtered by genre.
    *   **Query Params:** `?genreId=int` (optional)
    *   **Success Response (200):** `[{ "id": int, "title": "string", "genre": { "id": int, "name": "string" }, ... }, ...]`
*   **`GET /movies/{movieId}`** (Public)
    *   **Description:** Gets details for a specific movie.
    *   **Success Response (200):** `{ "id": int, "title": "string", ... }`
    *   **Error Responses:** 404
*   **`PUT /movies/{movieId}`** (Admin)
    *   **Description:** Updates movie details.
    *   **Request Body:** (Similar to POST)
    *   **Success Response (200):** `{ "id": int, ... }`
    *   **Error Responses:** 400, 404
*   **`DELETE /movies/{movieId}`** (Admin)
    *   **Description:** Deletes a movie (and associated showtimes due to CASCADE).
    *   **Success Response (204):** No Content.
    *   **Error Responses:** 404

---

### 4.5 Showtimes (`/showtimes`, `/movies/{movieId}/showtimes`)

*   **`POST /movies/{movieId}/showtimes`** (Admin)
    *   **Description:** Adds a showtime for a movie. **Requires application-level overlap check.**
    *   **Request Body:** `{ "theater_id": int, "start_time": "ISO8601_string", "end_time": "ISO8601_string" }`
    *   **Success Response (201):** `{ "id": int, "movie_id": ..., "theater_id": ..., "start_time": ..., "end_time": ... }`
    *   **Error Responses:** 400, 404 (Movie/Theater not found), 409 (Overlap conflict)
*   **`GET /movies/{movieId}/showtimes`** (Public)
    *   **Description:** Lists showtimes for a specific movie.
    *   **Success Response (200):** `[{ "id": int, "start_time": "...", "theater": { "id": int, "name": "string" }, ... }, ...]`
*   **`GET /showtimes?date=YYYY-MM-DD`** (Public)
    *   **Description:** Lists all showtimes for a specific date.
    *   **Success Response (200):** `[{ "id": int, "start_time": "...", "movie": { ... }, "theater": { ... } }, ...]`
*   **`PUT /showtimes/{showtimeId}`** (Admin)
    *   **Description:** Updates showtime details. **Requires application-level overlap check.**
    *   **Request Body:** (Similar to POST)
    *   **Success Response (200):** `{ "id": int, ... }`
    *   **Error Responses:** 400, 404, 409 (Overlap conflict)
*   **`DELETE /showtimes/{showtimeId}`** (Admin)
    *   **Description:** Deletes a showtime. Prevented if active reservations exist (`ON DELETE RESTRICT`).
    *   **Success Response (204):** No Content.
    *   **Error Responses:** 404, 409 (Reservations exist)

---

### 4.6 Reservations (`/reservations`, `/showtimes/{showtimeId}/seats`)

*   **`GET /showtimes/{showtimeId}/seats`** (Authenticated)
    *   **Description:** Gets the seat layout for a showtime, indicating which seats are reserved.
    *   **Success Response (200):** `[{ "id": int, "row_identifier": "string", "seat_number": int, "is_reserved": boolean }, ...]`
    *   **Error Responses:** 404 (Showtime not found)
*   **`POST /reservations`** (Authenticated)
    *   **Description:** Creates a new reservation for the logged-in user. **Requires transaction and locking (`SELECT FOR UPDATE`) for concurrency control.**
    *   **Request Body:** `{ "showtime_id": int, "seat_ids": [int, ...] }`
    *   **Success Response (201):** `{ "id": int, "showtime_id": int, "seats": [...], "status": "confirmed", ... }`
    *   **Error Responses:** 400, 401, 404 (Showtime/Seat not found), 409 (Seat already reserved)
*   **`GET /reservations/me`** (Authenticated)
    *   **Description:** Gets the current user's upcoming reservations.
    *   **Success Response (200):** `[{ "id": int, "showtime": { ... }, "movie": { ... }, "theater": { ... }, "seats": [{ "row_identifier": "A", "seat_number": 1 }, ...], "status": "confirmed", ... }, ...]`
*   **`DELETE /reservations/{reservationId}`** (Authenticated - Owner Only)
    *   **Description:** Cancels an upcoming reservation owned by the user (updates status to 'cancelled' or deletes).
    *   **Success Response (200/204):** Updated reservation details or No Content.
    *   **Error Responses:** 401, 403 (Not owner), 404

---

### 4.7 Admin Reporting (`/admin`)

*   **`GET /admin/reservations?showtimeId={id}`** (Admin)
    *   **Description:** Gets all reservations (including user details) for a specific showtime.
    *   **Success Response (200):** `[{ "id": int, "user": { ... }, "seats": [...], "status": "...", ... }, ...]`
    *   **Error Responses:** 404
*   **`GET /admin/reports/capacity?date=YYYY-MM-DD`** (Admin)
    *   **Description:** Reports on seat capacity and occupancy per showtime/movie for a given date.
    *   **Success Response (200):** `[{ "showtime_id": int, "movie_title": "string", "theater_name": "string", "start_time": "...", "total_seats": int, "reserved_seats": int, "occupancy_percent": float }, ...]`

---

## 5. Key Logic & Business Rules

*   **Authentication:**
    *   Use JWT for stateless session management. Include `userId`, `username`, `role` in the payload.
    *   Store passwords securely hashed using `bcrypt`.
*   **Authorization:**
    *   Implement middleware to verify JWT on protected routes.
    *   Implement role-based access control middleware to check user role against endpoint requirements (e.g., `/admin/*` requires 'admin' role).
*   **Seat Reservation Concurrency:**
    *   **Critical:** The `POST /reservations` endpoint MUST use a database transaction.
    *   Within the transaction, use `SELECT ... FOR UPDATE` on the relevant rows in `reserved_seats` (or potentially `seats` if locking the seat definition itself) for the specific `showtime_id` and requested `seat_ids` *before* inserting the new reservation. This prevents race conditions where two users try to book the same seat simultaneously.
    *   If the `SELECT FOR UPDATE` indicates a lock or finds existing confirmed reservations for the requested seats/showtime, rollback the transaction and return a conflict error (409).
*   **Showtime Overlap Prevention:**
    *   **Critical:** The database schema cannot enforce this directly for the *same theater*.
    *   Before inserting or updating a showtime (`POST /movies/{movieId}/showtimes`, `PUT /showtimes/{showtimeId}`), the application logic MUST query existing showtimes for the *same `theater_id`* and check if the new/updated `start_time` and `end_time` overlap with any existing ones. Return a conflict error (409) if an overlap is detected.
*   **Reporting:**
    *   Admin reports (`/admin/reports/*`) will require potentially complex SQL queries involving multiple joins and aggregations. Optimize these queries carefully. Consider database views if complexity increases.

## 6. Error Handling

*   Implement consistent error responses. A possible format:
    ```json
    {
      "error": {
        "status": number, // e.g., 400, 401, 404, 409, 500
        "message": "string" // User-friendly error description
        // "details": "..." // Optional: More specific details for debugging (dev environment)
      }
    }
    ```
*   Use standard HTTP status codes correctly.
*   Handle database errors, validation errors, authentication/authorization failures, and business logic conflicts gracefully.
*   Implement logging (e.g., using Winston or Pino for Node.js) to track requests, errors, and key events.

## 7. Development Setup Notes

*   **Environment Variables:** Use environment variables (`.env` file) for sensitive information like database credentials, JWT secret, server port, etc.
*   **Seed Data:** Create a script (e.g., `npm run seed`) to populate initial data:
    *   `roles` table ('admin', 'user').
    *   An initial 'admin' `user` (with a securely hashed password).
    *   Initial `genres`.
    *   Optionally, sample `movies`, `theaters`, `seats`, and `showtimes` for testing.
*   **Database Initialization:** Ensure the `schema.sql` can be run easily to set up or reset the database (e.g., via an npm script or directly using the `mysql` client).
*   **Development Methodology:** The system will be developed module by module (e.g., Authentication, Movies, Showtimes, Reservations). Each module will have corresponding unit tests written and passing before integrating or moving to the next module. This ensures code quality and maintainability.

