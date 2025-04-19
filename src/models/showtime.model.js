const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Showtime = sequelize.define('Showtime', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    movieId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'movies',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE', // Or 'SET NULL' if showtimes should remain if movie is deleted
    },
    theaterId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'theaters',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE', // Or 'SET NULL'
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false, // Consider calculating this based on movie duration + buffer
    },
    // Add other relevant details like price, available seats (if not managing individual seats)
    // availableSeats: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    // }
  }, {
    tableName: 'showtimes',
    timestamps: true,
    indexes: [
        // Index for querying showtimes by theater and time
        {
            fields: ['theaterId', 'startTime', 'endTime'],
        },
        // Index for querying showtimes by movie
        {
            fields: ['movieId'],
        }
    ]
  });

  Showtime.associate = (models) => {
    Showtime.belongsTo(models.Movie, { foreignKey: 'movieId', as: 'movie' });
    Showtime.belongsTo(models.Theater, { foreignKey: 'theaterId', as: 'theater' });
    // Association with Bookings/Reservations would go here
    // Showtime.hasMany(models.Booking, { foreignKey: 'showtimeId' });
  };

  // Instance method example (optional) - could be useful
  Showtime.prototype.getDurationMinutes = function() {
    if (!this.startTime || !this.endTime) return null;
    const durationMillis = this.endTime.getTime() - this.startTime.getTime();
    return Math.round(durationMillis / (1000 * 60));
  };


  return Showtime;
};
