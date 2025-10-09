const { DataTypes } = require('sequelize');
// Remove direct import of sequelize
// const { sequelize } = require('../config/database');

module.exports = (sequelize, DataTypes) => { // Export a function
  const Role = sequelize.define('Role', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        isIn: [['admin', 'user', 'moderator']], // Example roles, adjust as needed
      },
    },
  }, {
    tableName: 'roles',
    timestamps: false, // Keep timestamps false if not needed
  });

  Role.associate = (models) => {
    Role.hasMany(models.User, {
      foreignKey: 'role_id',
    });
  };

  return Role; // Return the defined model
};