const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Movie = sequelize.define('Movie', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    releaseYear: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    // Add other relevant fields like director, duration, rating, etc.
    // Foreign key for Genre
    genreId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Or false depending on requirements
        references: {
            model: 'Genres', // 'Genres' is the table name Sequelize generates
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', // Or 'CASCADE' or 'RESTRICT'
    },
  }, {
    // Model options
    timestamps: true, // Adds createdAt and updatedAt fields
    tableName: 'Movies' // Explicitly define table name if needed
  });

  Movie.associate = (models) => {
    // Define associations here
    Movie.belongsTo(models.Genre, {
      foreignKey: 'genreId',
      as: 'genre' // Optional alias
    });
    // Add associations to other models if necessary (e.g., Actors, Directors)
  };


  return Movie;
};
