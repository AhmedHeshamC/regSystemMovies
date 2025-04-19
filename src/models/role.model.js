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

  // Define associations within an associate method
  Role.associate = (models) => {
    Role.belongsToMany(models.User, {
      through: 'user_roles', // Name of the join table
      foreignKey: 'roleId',   // Foreign key in the join table referencing Role
      otherKey: 'userId'     // Foreign key in the join table referencing User
    });
    // Add other associations here if needed
  };

  return Role; // Return the defined model
};