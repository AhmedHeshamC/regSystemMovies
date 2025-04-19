# Movie Reservation System API - By Ahmed Hesham

This is the backend API for a Movie Reservation System, allowing users to browse movies, view showtimes, and make reservations, while providing administrative endpoints for managing users, genres, movies, theaters, and showtimes.

## Table of Contents

*   [Overview](#overview)
*   [Technology Stack](#technology-stack)
*   [Prerequisites](#prerequisites)
*   [Installation](#installation)
*   [Running the Application](#running-the-application)
*   [Testing with Postman](#testing-with-postman)
*   [API Endpoints](#api-endpoints)
    *   [Authentication (`/api/v1/auth`)](#authentication-apiv1auth)
    *   [User Management (`/api/v1/users`)](#user-management-apiv1users)
    *   [Genre Management (`/api/v1/genres`)](#genre-management-apiv1genres)
    *   [Movie Management (`/api/v1/movies`)](#movie-management-apiv1movies)
    *   [Theater Management (`/api/v1/theaters`)](#theater-management-apiv1theaters)
    *   [Showtime Management (`/api/v1/showtimes`)](#showtime-management-apiv1showtimes)
    *   [Reservation Management (`/api/v1/reservations`)](#reservation-management-apiv1reservations)
*   [License](#license)

## Overview

This project provides a RESTful API built with Node.js and Express. It uses Sequelize as an ORM to interact with a MySQL database. Key features include:

*   User authentication (signup, login, JWT-based sessions).
*   Role-based access control (Admin vs. User).
*   CRUD operations for Genres, Movies, Theaters, and Showtimes (Admin only).
*   User management (listing, promoting users - Admin only).
*   Movie browsing and filtering.
*   Showtime listing and seat availability checking.
*   Seat reservation creation and management.

## Technology Stack

*   **Backend Framework:** Node.js with Express.js
*   **Database:** MySQL
*   **ORM:** Sequelize
*   **Authentication:** JWT (JSON Web Tokens) using `jsonwebtoken`
*   **Password Hashing:** `bcrypt`
*   **Validation:** `express-validator`
*   **Security Middleware:** Helmet
*   **Environment Variables:** `dotenv`

## Prerequisites

*   Node.js (Version >=18 recommended) and npm installed.
*   A running MySQL database instance.

## Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd regSystemMovies
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    *   Create a `.env` file in the project root.
    *   Copy the contents of `.env.example` (if provided) or add the following variables, replacing the placeholder values with your actual database credentials:
        ```dotenv:.env
        NODE_ENV=development
        PORT=3000

        # Database Configuration
        DB_DATABASE=your_database_name
        DB_USERNAME=your_database_user
        DB_PASSWORD=your_database_password
        DB_HOST=localhost
        DB_PORT=3306
        DB_DIALECT=mysql

        # JWT Configuration
        JWT_SECRET=your_very_strong_jwt_secret # CHANGE THIS!
        JWT_EXPIRES_IN=1h

        # Default Admin User (for seeding)
        ADMIN_USERNAME=admin
        ADMIN_PASSWORD=password123 # CHANGE THIS for security!
        ```
    *   **Important:** Ensure the database specified in `DB_DATABASE` exists on your MySQL server.

4.  **Database Seeding:**
    *   This command syncs the database schema based on your Sequelize models and populates it with initial data (roles and the default admin user defined in your `.env` or seed files).
    ```bash
    npm run db:seed
    ```

## Running the Application

*   **Development Mode (with auto-reload):**
    ```bash
    npm run dev
    ```
*   **Production Mode:**
    ```bash
    npm start
    ```

The API will typically be available at `http://localhost:3000` (or the port specified in your `.env` file).

## Testing with Postman

1.  **Get Admin Token:**
    *   **Method:** `POST`
    *   **URL:** `/api/v1/auth/login`
    *   **Body (raw, JSON):** Use the admin credentials defined during seeding (e.g., from `.env` or defaults in your seed files).
        ```json
        {
            "username": "admin",
            "password": "password123"
        }
        ```
    *   **Response:** Copy the `token` value. This is your `ADMIN_TOKEN`. You will need to include this token in the `Authorization` header for protected admin endpoints (`Bearer <ADMIN_TOKEN>`).

2.  **Register a Regular User:**
    *   **Method:** `POST`
    *   **URL:** `/api/v1/auth/signup`
    *   **Body (raw, JSON):**
        ```json
        {
            "username": "testuser",
            "password": "password456"
        }
        ```

3.  **Get Regular User Token:**
    *   **Method:** `POST`
    *   **URL:** `/api/v1/auth/login`
    *   **Body (raw, JSON):** Use the credentials you just registered.
        ```json
        {
            "username": "testuser",
            "password": "password456"
        }
        ```
    *   **Response:** Copy the `token` value. This is your `USER_TOKEN`. Use this in the `Authorization` header for endpoints requiring regular user authentication (`Bearer <USER_TOKEN>`).

## API Endpoints

Base URL: `/api/v1`

---

### Authentication (`/auth`)

*   **`POST /signup`**
    *   **Description:** Registers a new user with the 'user' role.
    *   **Auth:** None.
    *   **Body:** `username`, `password`.
    *   **Validation:** See validation rules in the codebase.
    *   **Response (201):** New user object (excluding password).
    *   **Response (400):** Validation errors.
    *   **Response (409):** Username already exists.

*   **`POST /login`**
    *   **Description:** Authenticates a user and returns a JWT.
    *   **Auth:** None.
    *   **Body:** `username`, `password`.
    *   **Validation:** See validation rules in the codebase.
    *   **Response (200):** `{ "token": "JWT_TOKEN" }`.
    *   **Response (400):** Validation errors.
    *   **Response (401):** Invalid credentials.

*   **`POST /logout`**
    *   **Description:** Placeholder for client-side token removal. API confirms receipt.
    *   **Auth:** Requires valid JWT (`Bearer <TOKEN>`).
    *   **Response (200):** `{ "message": "Logged out successfully" }`.
    *   **Response (401):** Missing/invalid token.

*   **`POST /admin/create`**
    *   **Description:** Creates a new user with the 'admin' role.
    *   **Auth:** Requires Admin JWT (`Bearer <ADMIN_TOKEN>`).
    *   **Body:** `username`, `password`.
    *   **Validation:** Similar to signup validation rules.
    *   **Response (201):** New admin user object (excluding password).
    *   **Response (400):** Validation errors.
    *   **Response (401/403):** Authentication/Authorization error.
    *   **Response (409):** Username already exists.

---

### User Management (`/users`)

*   **`GET /`**
    *   **Description:** Lists all users with their roles (excluding passwords).
    *   **Auth:** Requires Admin JWT (`Bearer <ADMIN_TOKEN>`).
    *   **Response (200):** Array of user objects with nested role details.
    *   **Response (401/403):** Authentication/Authorization error.

*   **`PUT /:userId/promote`**
    *   **Description:** Promotes the specified user to the 'admin' role.
    *   **Auth:** Requires Admin JWT (`Bearer <ADMIN_TOKEN>`).
    *   **URL Parameter:** `userId` - ID of the user to promote.
    *   **Response (200):** Success message and the updated user object.
    *   **Response (400):** Invalid `userId`.
    *   **Response (401/403):** Authentication/Authorization error.
    *   **Response (404):** User not found.
    *   **Response (500):** Internal error (e.g., 'admin' role not found).

---

### Genre Management (`/genres`)

*   **`POST /`**
    *   **Description:** Creates a new genre.
    *   **Auth:** Requires Admin JWT (`Bearer <ADMIN_TOKEN>`).
    *   **Body:** `name`.
    *   **Validation:** See validation rules in the codebase.
    *   **Response (201):** The newly created genre object.
    *   **Response (400):** Validation errors.
    *   **Response (401/403):** Authentication/Authorization error.
    *   **Response (409):** Genre name already exists.

*   **`GET /`**
    *   **Description:** Lists all genres.
    *   **Auth:** None.
    *   **Response (200):** Array of genre objects.

*   **`PUT /:genreId`**
    *   **Description:** Updates an existing genre.
    *   **Auth:** Requires Admin JWT (`Bearer <ADMIN_TOKEN>`).
    *   **URL Parameter:** `genreId` - ID of the genre to update.
    *   **Body:** `name`.
    *   **Validation:** See validation rules in the codebase.
    *   **Response (200):** The updated genre object.
    *   **Response (400):** Validation errors / Invalid `genreId`.
    *   **Response (401/403):** Authentication/Authorization error.
    *   **Response (404):** Genre not found.
    *   **Response (409):** Updated genre name already exists.

*   **`DELETE /:genreId`**
    *   **Description:** Deletes a genre.
    *   **Auth:** Requires Admin JWT (`Bearer <ADMIN_TOKEN>`).
    *   **URL Parameter:** `genreId` - ID of the genre to delete.
    *   **Response (204):** No content.
    *   **Response (400):** Invalid `genreId`.
    *   **Response (401/403):** Authentication/Authorization error.
    *   **Response (404):** Genre not found.

---

### Movie Management (`/movies`)

*   **`POST /`**
    *   **Description:** Adds a new movie.
    *   **Auth:** Requires Admin JWT (`Bearer <ADMIN_TOKEN>`).
    *   **Body:** `title`, `description`, `poster_image_url` (optional), `releaseYear` (optional, integer), `duration_minutes` (optional, integer), `genreId` (required, must exist).
    *   **Validation:** Checks for required fields, valid `genreId`, data types.
    *   **Response (201):** The newly created movie object.
    *   **Response (400):** Validation errors (e.g., missing fields, invalid `genreId`, genre not found).
    *   **Response (401/403):** Authentication/Authorization error.

*   **`GET /`**
    *   **Description:** Lists all movies. Can be filtered by genre.
    *   **Auth:** None.
    *   **Query Parameter (Optional):** `genreId` - Filter movies by the specified genre ID (e.g., `?genreId=1`).
    *   **Response (200):** Array of movie objects, potentially including associated genre details.
    *   **Response (400):** Invalid `genreId` format if provided for filtering.

*   **`GET /:movieId`**
    *   **Description:** Gets details for a specific movie.
    *   **Auth:** None.
    *   **URL Parameter:** `movieId` - ID of the movie.
    *   **Response (200):** The movie object, potentially including associated genre details.
    *   **Response (400):** Invalid `movieId` format.
    *   **Response (404):** Movie not found.

*   **`PUT /:movieId`**
    *   **Description:** Updates an existing movie.
    *   **Auth:** Requires Admin JWT (`Bearer <ADMIN_TOKEN>`).
    *   **URL Parameter:** `movieId` - ID of the movie to update.
    *   **Body:** Fields to update (e.g., `title`, `description`, `genreId`, etc.).
    *   **Validation:** Checks for valid fields and `genreId` if provided.
    *   **Response (200):** The updated movie object.
    *   **Response (400):** Validation errors / Invalid `movieId` format / Genre not found if `genreId` is updated.
    *   **Response (401/403):** Authentication/Authorization error.
    *   **Response (404):** Movie not found.

*   **`DELETE /:movieId`**
    *   **Description:** Deletes a movie.
    *   **Auth:** Requires Admin JWT (`Bearer <ADMIN_TOKEN>`).
    *   **URL Parameter:** `movieId` - ID of the movie to delete.
    *   **Response (204):** No content.
    *   **Response (400):** Invalid `movieId` format.
    *   **Response (401/403):** Authentication/Authorization error.
    *   **Response (404):** Movie not found.

---

### Theater Management (`/theaters`)

*   **`POST /`**
    *   **Description:** Creates a new theater.
    *   **Auth:** Requires Admin JWT (`Bearer <ADMIN_TOKEN>`).
    *   **Body:** `name`, `location`, `capacity` (or seat layout details).
    *   **Response (201):** The newly created theater object.
    *   **Response (400):** Validation errors.
    *   **Response (401/403):** Authentication/Authorization error.

*   **`GET /`**
    *   **Description:** Lists all theaters.
    *   **Auth:** None / User JWT (Depends on implementation).
    *   **Response (200):** Array of theater objects.

*   **`GET /:id`**
    *   **Description:** Gets details for a specific theater.
    *   **Auth:** None / User JWT.
    *   **URL Parameter:** `id` - ID of the theater.
    *   **Response (200):** The theater object.
    *   **Response (400):** Invalid `id` format.
    *   **Response (404):** Theater not found.

*   **`PUT /:id`**
    *   **Description:** Updates an existing theater.
    *   **Auth:** Requires Admin JWT (`Bearer <ADMIN_TOKEN>`).
    *   **URL Parameter:** `id` - ID of the theater to update.
    *   **Body:** Fields to update (e.g., `name`, `location`).
    *   **Response (200):** The updated theater object.
    *   **Response (400):** Validation errors / Invalid `id`.
    *   **Response (401/403):** Authentication/Authorization error.
    *   **Response (404):** Theater not found.

*   **`DELETE /:id`**
    *   **Description:** Deletes a theater.
    *   **Auth:** Requires Admin JWT (`Bearer <ADMIN_TOKEN>`).
    *   **URL Parameter:** `id` - ID of the theater to delete.
    *   **Response (204):** No content.
    *   **Response (400):** Invalid `id`.
    *   **Response (401/403):** Authentication/Authorization error.
    *   **Response (404):** Theater not found.

---

### Showtime Management (`/showtimes`)

*   **`POST /`** (Admin)
*   **`GET /`** (Public/User - potentially with movie/theater/date filters)
*   **`GET /:id`** (Public/User)
*   **`PUT /:id`** (Admin)
*   **`DELETE /:id`** (Admin)
*   **`GET /:id/seats`** (Public/User - To get available/reserved seats for a showtime)

---

### Reservation Management (`/reservations`)

*   **`POST /`**
    *   **Description:** Creates a new reservation for the authenticated user.
    *   **Auth:** Requires User JWT (`Bearer <USER_TOKEN>`).
    *   **Body:** `showtimeId`, `seatIds` (array of seat IDs).
    *   **Validation:** Checks `showtimeId`, `seatIds`, seat availability.
    *   **Response (201):** The newly created reservation object with details.
    *   **Response (400):** Validation errors (missing fields, invalid IDs).
    *   **Response (401/403):** Authentication/Authorization error.
    *   **Response (404):** Showtime or Seat(s) not found.
    *   **Response (409):** Seat(s) already reserved for this showtime.
    *   **Response (500):** Internal server error (e.g., transaction failure).

*   **`GET /`**
    *   **Description:** Lists all reservations (Admin) or reservations for the current user (User).
    *   **Auth:** Requires Admin JWT (`Bearer <ADMIN_TOKEN>`) or User JWT (`Bearer <USER_TOKEN>`).
    *   **Response (200):** Array of reservation objects.
    *   **Response (401/403):** Authentication/Authorization error.

*   **`GET /:reservationId`**
    *   **Description:** Gets details for a specific reservation.
    *   **Auth:** Requires JWT (`Bearer <TOKEN>`). User must be owner or admin.
    *   **URL Parameter:** `reservationId` - ID of the reservation.
    *   **Response (200):** The reservation object.
    *   **Response (400):** Invalid `reservationId`.
    *   **Response (401/403):** Authentication/Authorization error (not owner or admin).
    *   **Response (404):** Reservation not found.

*   **`PUT /:reservationId/cancel`**
    *   **Description:** Cancels a specific reservation (updates status).
    *   **Auth:** Requires JWT (`Bearer <TOKEN>`). User must be owner or admin.
    *   **URL Parameter:** `reservationId` - ID of the reservation to cancel.
    *   **Response (200):** The updated reservation object with `status: "cancelled"`.
    *   **Response (400):** Invalid `reservationId` / Reservation already cancelled.
    *   **Response (401/403):** Authentication/Authorization error.
    *   **Response (404):** Reservation not found.

*   **`DELETE /:reservationId`**
    *   **Description:** Deletes a reservation permanently.
    *   **Auth:** Requires Admin JWT (`Bearer <ADMIN_TOKEN>`).
    *   **URL Parameter:** `reservationId` - ID of the reservation to delete.
    *   **Response (204):** No content.
    *   **Response (400):** Invalid `reservationId`.
    *   **Response (401/403):** Authentication/Authorization error.
    *   **Response (404):** Reservation not found.

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.

(You might want to create a `LICENSE` file in your root directory with the standard MIT License text if you don't have one.)

## Project URLs
*   **GitHub Repository:** [Your GitHub URL]
- https://roadmap.sh/projects/movie-reservation-system
