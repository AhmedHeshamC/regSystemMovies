const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Theater = sequelize.define('Theater', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
    // Add other relevant theater details like screen type, etc. if needed
  }, {
    tableName: 'theaters',
    timestamps: true, // or false if you don't want createdAt/updatedAt
  });

  Theater.associate = (models) => {
    Theater.hasMany(models.Showtime, { foreignKey: 'theaterId', as: 'showtimes' });
    // If implementing seats per theater:
    // Theater.hasMany(models.Seat, { foreignKey: 'theaterId', as: 'seats' });
  };

  return Theater;
};
