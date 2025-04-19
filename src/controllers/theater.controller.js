const theaterService = require('../services/theater.service');

// Controller to create a new theater
exports.create = async (req, res) => {
    try {
        // Basic validation
        const { name, location, capacity } = req.body;
        if (!name || !location || !capacity) {
            return res.status(400).send({ message: 'Missing required fields: name, location, capacity.' });
        }
        if (typeof capacity !== 'number' || capacity <= 0) {
             return res.status(400).send({ message: 'Capacity must be a positive number.' });
        }

        const theater = await theaterService.createTheater({ name, location, capacity });
        res.status(201).send(theater);
    } catch (error) {
        console.error("Error creating theater:", error);
         if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).send({ message: 'Theater with this name or location might already exist.' });
        }
        res.status(500).send({ message: 'Error creating theater.' });
    }
};

// Controller to get all theaters
exports.findAll = async (req, res) => {
    try {
        const theaters = await theaterService.findAllTheaters();
        res.status(200).send(theaters);
    } catch (error) {
        console.error("Error fetching theaters:", error);
        res.status(500).send({ message: 'Error retrieving theaters.' });
    }
};

// Controller to get a single theater by ID
exports.findOne = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
         if (isNaN(id)) {
            return res.status(400).send({ message: 'Invalid theater ID.' });
        }
        const theater = await theaterService.findTheaterById(id);
        if (theater) {
            res.status(200).send(theater);
        } else {
            res.status(404).send({ message: `Theater with id=${id} not found.` });
        }
    } catch (error) {
        console.error(`Error fetching theater with id=${req.params.id}:`, error);
        res.status(500).send({ message: 'Error retrieving theater.' });
    }
};

// Controller to update a theater by ID
exports.update = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
         if (isNaN(id)) {
            return res.status(400).send({ message: 'Invalid theater ID.' });
        }

        // Basic validation for update payload
        const { name, location, capacity } = req.body;
         if (Object.keys(req.body).length === 0) {
             return res.status(400).send({ message: 'Update data cannot be empty.' });
        }
        if (capacity !== undefined && (typeof capacity !== 'number' || capacity <= 0)) {
             return res.status(400).send({ message: 'Capacity must be a positive number.' });
        }


        const updatedTheater = await theaterService.updateTheater(id, req.body);
        if (updatedTheater) { // Service returns the updated object or null if not found
             res.status(200).send(updatedTheater);
        } else {
             // If service returns null, it means the theater wasn't found initially
            res.status(404).send({ message: `Theater with id=${id} not found.` });
        }
    } catch (error) {
         console.error(`Error updating theater with id=${req.params.id}:`, error);
         if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).send({ message: 'Theater with this name or location might already exist.' });
        }
        res.status(500).send({ message: 'Error updating theater.' });
    }
};

// Controller to delete a theater by ID
exports.delete = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
         if (isNaN(id)) {
            return res.status(400).send({ message: 'Invalid theater ID.' });
        }

        const success = await theaterService.deleteTheater(id);
        if (success) {
            res.status(200).send({ message: 'Theater deleted successfully.' });
            // Alternative: res.status(204).send(); // No Content
        } else {
            res.status(404).send({ message: `Theater with id=${id} not found.` });
        }
    } catch (error) {
        console.error(`Error deleting theater with id=${req.params.id}:`, error);
        res.status(500).send({ message: 'Error deleting theater.' });
    }
};
