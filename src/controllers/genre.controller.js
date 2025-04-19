// src/controllers/genre.controller.js
const genreService = require('../services/genre.service');
const createError = require('http-errors');

// Controller to handle genre creation
const createGenre = async (req, res, next) => {
  try {
    const { name } = req.body;
    const genre = await genreService.createGenre(name);
    res.status(201).json(genre);
  } catch (error) {
    next(error); // Pass errors to the error handler
  }
};

// Controller to handle fetching all genres
const getAllGenres = async (req, res, next) => {
  try {
    const genres = await genreService.getAllGenres();
    res.status(200).json(genres);
  } catch (error) {
    next(error);
  }
};

// Controller to handle fetching a single genre by ID
const getGenreById = async (req, res, next) => {
    try {
        const genreId = parseInt(req.params.genreId, 10);
        if (isNaN(genreId)) {
            throw createError(400, 'Invalid genre ID.');
        }
        const genre = await genreService.getGenreById(genreId);
        res.status(200).json(genre);
    } catch (error) {
        next(error);
    }
};

// Controller to handle updating a genre
const updateGenre = async (req, res, next) => {
  try {
    const genreId = parseInt(req.params.genreId, 10);
    if (isNaN(genreId)) {
        throw createError(400, 'Invalid genre ID.');
    }
    const { name } = req.body;
    const updatedGenre = await genreService.updateGenre(genreId, name);
    res.status(200).json(updatedGenre);
  } catch (error) {
    next(error);
  }
};

// Controller to handle deleting a genre
const deleteGenre = async (req, res, next) => {
  try {
    const genreId = parseInt(req.params.genreId, 10);
    if (isNaN(genreId)) {
        throw createError(400, 'Invalid genre ID.');
    }
    await genreService.deleteGenre(genreId);
    res.status(204).send(); // No Content
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createGenre,
  getAllGenres,
  getGenreById,
  updateGenre,
  deleteGenre,
};
