const { DataTypes } = require('sequelize');
// Remove direct import of sequelize
// const { sequelize } = require('../config/database');

module.exports = (sequelize, DataTypes) => { // Export a function
  const Genre = sequelize.define('Genre', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
  }, {
    tableName: 'genres',
    timestamps: false, // Keep timestamps false if not needed
  });

  // Define associations within an associate method
  Genre.associate = (models) => {
    // Example: A Genre can have many Movies
    Genre.hasMany(models.Movie, {
      foreignKey: 'genreId',
      as: 'movies' // Optional alias
    });
    // Add other associations here if needed
  };

  return Genre; // Return the defined model
};