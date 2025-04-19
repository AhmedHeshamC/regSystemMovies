const express = require('express');
const helmet = require('helmet'); // For security headers
const cors = require('cors'); // If your frontend is on a different origin
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes'); // Import user routes
const genreRoutes = require('./routes/genre.routes'); // Import genre routes
const movieRoutes = require('./routes/movie.routes'); // Import movie routes
const showtimeRoutes = require('./routes/showtime.routes'); // Import showtime routes
const theaterRoutes = require('./routes/theater.routes'); // Import theater routes
const seatRoutes = require('./routes/seat.routes'); // Import seat routes
const reservationRoutes = require('./routes/reservation.routes'); // Import reservation routes
const adminRoutes = require('./routes/admin.routes'); // Import admin routes
// Import other routes as you create them...
// const genreRoutes = require('./routes/genre.routes');
// ...

// Assuming basic error handling middleware exists or will be added
// const errorHandler = require('./middleware/errorHandler');

const app = express();

// --- Middleware ---
app.use(helmet()); // Set various security HTTP headers
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// --- Routes ---
app.get('/', (req, res) => { // Basic health check route
    res.send('Movie Reservation System API is running!');
});

// Mount routes with /api/v1 prefix
app.use('/api/v1/auth', authRoutes); // Mount authentication routes (using /api/v1 prefix)
app.use('/api/v1/users', userRoutes); // Mount user routes
app.use('/api/v1/genres', genreRoutes); // Mount genre routes
app.use('/api/v1/movies', movieRoutes); // Mount movie routes
app.use('/api/v1/showtimes', showtimeRoutes); // Mount showtime routes
app.use('/api/v1/theaters', theaterRoutes); // Mount theater routes
app.use('/api/v1/seats', seatRoutes); // Mount seat routes
app.use('/api/v1/reservations', reservationRoutes); // Mount reservation routes
app.use('/api/v1/admin', adminRoutes); // Mount admin routes
// Mount other routes here with /api/v1 prefix...
// app.use('/api/v1/movies', movieRoutes);
// ...

// --- Error Handling ---
// Add a 404 handler for routes not found
app.use((req, res, next) => {
    res.status(404).json({ error: { status: 404, message: 'Not Found' } });
});

// Add a generic error handler (should be last middleware)
// app.use(errorHandler); // Assuming you create this middleware
app.use((err, req, res, next) => {
    console.error(err); // Log the error
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({
        error: {
            status,
            message,
            // Optionally include stack trace in development
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        }
    });
});


module.exports = app; // Export app for server.js