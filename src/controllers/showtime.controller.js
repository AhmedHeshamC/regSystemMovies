const showtimeService = require('../services/showtime.service');

// Controller to create a new showtime
exports.create = async (req, res) => {
    try {
        // Basic validation (more robust validation can be added with libraries like Joi)
        const { movieId, theaterId, startTime, endTime } = req.body;
        if (!movieId || !theaterId || !startTime || !endTime) {
            return res.status(400).send({ message: 'Missing required fields: movieId, theaterId, startTime, endTime.' });
        }

        const showtime = await showtimeService.createShowtime({ movieId, theaterId, startTime, endTime });
        res.status(201).send(showtime);
    } catch (error) {
        console.error("Error creating showtime:", error);
        // Send specific error messages based on service exceptions
        if (error.message.includes('overlaps') || error.message.includes('Invalid start or end time')) {
             res.status(409).send({ message: error.message }); // 409 Conflict for overlaps/invalid time
        } else if (error.message.includes('not found')) {
             res.status(404).send({ message: error.message }); // 404 Not Found for movie/theater
        }
        else {
            res.status(500).send({ message: 'Error creating showtime.' });
        }
    }
};

// Controller to get all showtimes (with optional filtering)
exports.findAll = async (req, res) => {
    try {
        const { movieId, theaterId, date } = req.query; // Get filters from query params
        const filters = {};
        if (movieId) filters.movieId = parseInt(movieId, 10);
        if (theaterId) filters.theaterId = parseInt(theaterId, 10);
        if (date) filters.date = date; // Pass date string directly

        const showtimes = await showtimeService.findAllShowtimes(filters);
        res.status(200).send(showtimes);
    } catch (error) {
        console.error("Error fetching showtimes:", error);
        res.status(500).send({ message: 'Error retrieving showtimes.' });
    }
};

// Controller to get a single showtime by ID
exports.findOne = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
         if (isNaN(id)) {
            return res.status(400).send({ message: 'Invalid showtime ID.' });
        }
        const showtime = await showtimeService.findShowtimeById(id);
        if (showtime) {
            res.status(200).send(showtime);
        } else {
            res.status(404).send({ message: `Showtime with id=${id} not found.` });
        }
    } catch (error) {
        console.error(`Error fetching showtime with id=${req.params.id}:`, error);
        res.status(500).send({ message: 'Error retrieving showtime.' });
    }
};

// Controller to update a showtime by ID
exports.update = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
         if (isNaN(id)) {
            return res.status(400).send({ message: 'Invalid showtime ID.' });
        }

        // Basic validation for update payload
        const { movieId, theaterId, startTime, endTime } = req.body;
        if (Object.keys(req.body).length === 0) {
             return res.status(400).send({ message: 'Update data cannot be empty.' });
        }


        const updatedShowtime = await showtimeService.updateShowtime(id, req.body);
        if (updatedShowtime) {
            res.status(200).send(updatedShowtime);
        } else {
             // If service returns null, it means the showtime wasn't found initially
            res.status(404).send({ message: `Showtime with id=${id} not found.` });
        }
    } catch (error) {
         console.error(`Error updating showtime with id=${req.params.id}:`, error);
         // Send specific error messages based on service exceptions
        if (error.message.includes('overlaps') || error.message.includes('Invalid start or end time')) {
             res.status(409).send({ message: error.message }); // 409 Conflict
        } else if (error.message.includes('not found')) {
             res.status(404).send({ message: error.message }); // 404 Not Found for movie/theater during update
        } else {
            res.status(500).send({ message: 'Error updating showtime.' });
        }
    }
};

// Controller to delete a showtime by ID
exports.delete = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
         if (isNaN(id)) {
            return res.status(400).send({ message: 'Invalid showtime ID.' });
        }

        const success = await showtimeService.deleteShowtime(id);
        if (success) {
            res.status(200).send({ message: 'Showtime deleted successfully.' });
            // Alternative: res.status(204).send(); // No Content
        } else {
            res.status(404).send({ message: `Showtime with id=${id} not found.` });
        }
    } catch (error) {
        console.error(`Error deleting showtime with id=${req.params.id}:`, error);
        res.status(500).send({ message: 'Error deleting showtime.' });
    }
};
