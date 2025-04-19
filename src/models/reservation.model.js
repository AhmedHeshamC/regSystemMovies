const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Reservation = sequelize.define('Reservation', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users', // 'Users' refers to table name
        key: 'id',
      },
    },
    showtimeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Showtimes', // 'Showtimes' refers to table name
        key: 'id',
      },
    },
    reservedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'cancelled'),
      defaultValue: 'pending',
    }
  }, {
    tableName: 'reservations',
    timestamps: false,
    underscored: true
  });

  return Reservation;
};
