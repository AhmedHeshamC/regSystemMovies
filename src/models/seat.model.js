const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Seat = sequelize.define('Seat', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    theaterId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'theaters', // Assumes your theaters table is named 'theaters'
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE', // Or 'SET NULL' depending on requirements
    },
    row: {
      type: DataTypes.STRING(1), // e.g., 'A', 'B', 'C'
      allowNull: false,
    },
    number: {
      type: DataTypes.INTEGER, // e.g., 1, 2, 3
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('standard', 'premium', 'recliner'), // Example seat types
      defaultValue: 'standard',
    },
    // Add other seat properties if needed, e.g., is_accessible
  }, {
    tableName: 'seats',
    timestamps: false, // Seats might not need timestamps
    indexes: [
      // Unique constraint for seat within a theater
      {
        unique: true,
        fields: ['theaterId', 'row', 'number'],
      },
    ],
  });

  Seat.associate = (models) => {
    Seat.belongsTo(models.Theater, { foreignKey: 'theaterId', as: 'theater' });
    // Association with Bookings/Reservations would go here if implementing that feature
    // Seat.belongsToMany(models.Booking, { through: 'BookingSeats' });
  };

  return Seat;
};

// Note: Managing individual seats can be complex.
// Often, systems manage available capacity per showtime instead of individual seats,
// unless specific seat selection is required.
// This model assumes specific seat selection might be a future requirement.
// If only capacity is needed, this model might be simplified or removed,
// and capacity managed at the Theater or Showtime level.
