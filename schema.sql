-- Drop the database if it exists
DROP DATABASE IF EXISTS mov_reserv_system;

-- Create the database if it doesn't exist
-- Note: In MySQL, this is often run as a separate command before executing the rest of the script.
CREATE DATABASE IF NOT EXISTS mov_reserv_system;

-- Use the created database
USE mov_reserv_system;

-- Comprehensive Schema for Movie Reservation System (MySQL)

-- Roles Table: Defines user roles (e.g., 'admin', 'user')
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL CHECK (name IN ('admin', 'user')) -- CHECK constraint enforced in MySQL 8.0.16+
);

-- Users Table: Stores user information and credentials
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Store hashed passwords only!
    role_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- MySQL specific ON UPDATE
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- Genres Table: Movie categories
CREATE TABLE genres (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- Movies Table: Stores movie details
CREATE TABLE movies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    release_year INT, -- Added release year column
    poster_image_url VARCHAR(512),
    genre_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE SET NULL -- Or ON DELETE RESTRICT
);

-- Theaters Table: Represents physical locations or screens
CREATE TABLE theaters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL, -- Added location
    capacity INT NOT NULL CHECK (capacity > 0), -- Changed from total_seats to capacity
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seats Table: Represents individual seats within a theater layout
CREATE TABLE seats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    theater_id INT NOT NULL,
    `row` VARCHAR(10) NOT NULL, -- Changed from row_identifier to row (backticks needed if 'row' is reserved)
    `number` INT NOT NULL, -- Changed from seat_number to number (backticks needed if 'number' is reserved)
    `type` ENUM('standard', 'premium', 'recliner') DEFAULT 'standard', -- Added type
    UNIQUE KEY unique_seat_in_theater (theater_id, `row`, `number`), -- Updated unique key columns
    FOREIGN KEY (theater_id) REFERENCES theaters(id) ON DELETE CASCADE
);

-- Showtimes Table: Links movies to specific times and theaters
CREATE TABLE showtimes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    movie_id INT NOT NULL, -- Changed from movie_id to movieId to match model
    theater_id INT NOT NULL, -- Changed from theater_id to theaterId to match model
    start_time DATETIME NOT NULL, -- Changed from TIMESTAMP to DATETIME for potentially better timezone handling consistency if needed
    end_time DATETIME NOT NULL,   -- Changed from TIMESTAMP to DATETIME
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
    FOREIGN KEY (theater_id) REFERENCES theaters(id) ON DELETE CASCADE,
    INDEX idx_showtimes_theater_time (theater_id, start_time, end_time), -- Added index matching model
    INDEX idx_showtimes_movie_id (movie_id), -- Added index matching model
    CONSTRAINT check_start_end_time CHECK (end_time > start_time) -- CHECK constraint enforced in MySQL 8.0.16+
    -- Note: Preventing overlapping showtimes in the same theater requires application logic
    -- or potentially complex triggers in MySQL.
);

-- Reservations Table: Records user reservations for showtimes
CREATE TABLE reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    showtime_id INT NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('confirmed', 'cancelled', 'pending')), -- CHECK constraint enforced in MySQL 8.0.16+
    reserved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_price DECIMAL(10, 2), -- Optional: If implementing pricing
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (showtime_id) REFERENCES showtimes(id) ON DELETE RESTRICT
);

-- ReservedSeats Table: Junction table linking reservations to specific seats
CREATE TABLE reserved_seats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reservation_id INT NOT NULL,
    seat_id INT NOT NULL,
    FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
    FOREIGN KEY (seat_id) REFERENCES seats(id) ON DELETE RESTRICT,
    UNIQUE KEY unique_seat_per_reservation (reservation_id, seat_id) -- MySQL UNIQUE KEY syntax
    -- Note: Preventing double-booking the *same seat* for the *same showtime* across different reservations
    -- must be enforced by application logic during the reservation transaction (e.g., using SELECT ... FOR UPDATE).
);

-- Indexes for Performance --
-- Note: Primary Keys and Unique Keys automatically create indexes in MySQL.
-- Additional indexes can be added for frequently queried columns.

-- Users
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role_id ON users(role_id);

-- Movies
CREATE INDEX idx_movies_title ON movies(title);
CREATE INDEX idx_movies_genre_id ON movies(genre_id);

-- Theaters
CREATE INDEX idx_theaters_name ON theaters(name);
CREATE INDEX idx_theaters_location ON theaters(location); -- Added index for location

-- Seats (index on theater_id already exists due to FK/Unique Key)
-- CREATE INDEX idx_seats_theater_id ON seats(theater_id); -- Usually redundant

-- Showtimes
-- CREATE INDEX idx_showtimes_movie_id ON showtimes(movie_id); -- Already created above
-- CREATE INDEX idx_showtimes_theater_id ON showtimes(theater_id); -- Already part of composite index
-- CREATE INDEX idx_showtimes_start_time ON showtimes(start_time); -- Already part of composite index

-- Reservations
CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_reservations_showtime_id ON reservations(showtime_id);
CREATE INDEX idx_reservations_status ON reservations(status);

-- ReservedSeats (indexes on reservation_id and seat_id already exist due to FK/Unique Key)
-- CREATE INDEX idx_reserved_seats_reservation_id ON reserved_seats(reservation_id); -- Usually redundant
-- CREATE INDEX idx_reserved_seats_seat_id ON reserved_seats(seat_id); -- Usually redundant


-- Note on 'updated_at':
-- MySQL's `ON UPDATE CURRENT_TIMESTAMP` clause handles automatic updates for TIMESTAMP columns.
-- The PostgreSQL trigger function is not needed and has been removed.


-- Seed Data (Example - Should be run separately or via application logic)
/*
INSERT INTO roles (name) VALUES ('admin'), ('user');

-- Remember to hash the password securely before inserting!
-- Example: Insert an initial admin user (replace 'hashed_admin_password' with actual hash)
-- INSERT INTO users (username, password_hash, role_id)
-- VALUES ('admin_user', 'hashed_admin_password', (SELECT id FROM roles WHERE name = 'admin' LIMIT 1));

INSERT INTO genres (name) VALUES ('Action'), ('Comedy'), ('Drama'), ('Sci-Fi'), ('Horror');
*/

-- End of Schema --