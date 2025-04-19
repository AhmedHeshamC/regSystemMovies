const Sequelize = require('sequelize');
// Import the configured sequelize instance directly from database.js
const { sequelize } = require('../config/database'); 

const db = {};

db.Sequelize = Sequelize; // Export Sequelize constructor
db.sequelize = sequelize; // Export the *imported* configured instance

// Load models dynamically using the imported sequelize instance
// Make sure model files export a function like: module.exports = (sequelize, DataTypes) => { ... }
db.User = require('./user.model.js')(sequelize, Sequelize.DataTypes);
db.Role = require('./role.model.js')(sequelize, Sequelize.DataTypes);
db.Genre = require('./genre.model.js')(sequelize, Sequelize.DataTypes);
db.Movie = require('./movie.model.js')(sequelize, Sequelize.DataTypes);
// Add other models here in the same way
db.Theater = require('./theater.model.js')(sequelize, Sequelize.DataTypes);
db.Seat = require('./seat.model.js')(sequelize, Sequelize.DataTypes);
db.Showtime = require('./showtime.model.js')(sequelize, Sequelize.DataTypes);
db.Reservation = require('./reservation.model.js')(sequelize, Sequelize.DataTypes);
db.ReservedSeat = require('./reservedSeat.model.js')(sequelize, Sequelize.DataTypes);

// Run associate methods after all models are loaded
Object.keys(db).forEach(modelName => {
  // Ensure the property is a Sequelize model before trying to associate
  if (db[modelName] && db[modelName].associate) { 
    db[modelName].associate(db);
  }
});

// Define associations specifically
// User <-> Reservation (One-to-Many)
db.User.hasMany(db.Reservation, { foreignKey: 'userId' });
db.Reservation.belongsTo(db.User, { foreignKey: 'userId' });

// Showtime <-> Reservation (One-to-Many)
db.Showtime.hasMany(db.Reservation, { foreignKey: 'showtimeId' });
db.Reservation.belongsTo(db.Showtime, { foreignKey: 'showtimeId' });

// Reservation <-> ReservedSeat (One-to-Many)
db.Reservation.hasMany(db.ReservedSeat, { foreignKey: 'reservationId' });
db.ReservedSeat.belongsTo(db.Reservation, { foreignKey: 'reservationId' });

// Seat <-> ReservedSeat (One-to-Many)
db.Seat.hasMany(db.ReservedSeat, { foreignKey: 'seatId' });
db.ReservedSeat.belongsTo(db.Seat, { foreignKey: 'seatId' });

module.exports = db;
