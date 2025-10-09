require('dotenv').config({ path: './.env.test' });
const { sequelize } = require('../src/config/database');
const { ReservedSeat, Reservation, Showtime, Seat, Movie, Theater, Genre, User, Role } = require('../src/models');
const cache = require('../src/utils/cache.utils'); // Import the cache utility

exports.mochaHooks = {
  async beforeAll() {
    this.timeout(30000); // Set a longer timeout for the setup
    console.log('Connecting to test database for setup...');
    await sequelize.authenticate();
    console.log('Test database connection successful for setup.');

    console.log('Syncing test database models for setup...');
    await sequelize.sync({ force: true });
    console.log('Test database synced for setup.');
  },
  async beforeEach() {
    console.log('Clearing database before each test...');
    await ReservedSeat.destroy({ where: {} });
    await Reservation.destroy({ where: {} });
    await Showtime.destroy({ where: {} });
    await Seat.destroy({ where: {} });
    await Movie.destroy({ where: {} });
    await Theater.destroy({ where: {} });
    await Genre.destroy({ where: {} });
    await User.destroy({ where: {} });
    await Role.destroy({ where: {} });
    cache.flushAll(); // Clear the cache
    console.log('Database and cache cleared.');
  },
  async afterAll() {
    await sequelize.close();
    console.log('Test database connection closed after all tests.');
  }
};
