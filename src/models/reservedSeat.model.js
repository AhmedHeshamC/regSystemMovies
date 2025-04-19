const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ReservedSeat = sequelize.define('ReservedSeat', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    reservationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Reservations', // 'Reservations' refers to table name
        key: 'id',
      },
    },
    seatId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Seats', // 'Seats' refers to table name
        key: 'id',
      },
    },
  }, {
    tableName: 'reserved_seats', // Match the table name in schema.sql
    timestamps: false, // Usually no need for timestamps here
  });

  return ReservedSeat;
};
