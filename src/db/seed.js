require('dotenv').config({ path: '../../.env' }); // Load .env from root relative to this file's location
const { sequelize } = require('../config/database');
const Role = require('../models/role.model');
const User = require('../models/user.model');
const Genre = require('../models/genre.model'); // Assuming genre model exists or will be created
const bcrypt = require('bcrypt'); // Needed for admin password, though hook handles hashing

// --- Configuration ---
// IMPORTANT: Change this default admin password or load from environment variables for security!
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password123'; // CHANGE THIS

const seedDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connection successful.');

    // Sync all models (optional: use { force: true } to drop and recreate tables)
    // Be cautious with force: true in production or if you have important data!
    console.log('Syncing database models...');
    await sequelize.sync({ alter: true }); // Use alter: true to update tables without dropping
    console.log('Database synced.');

    // --- Seed Roles ---
    console.log('Seeding roles...');
    const roles = [
      { name: 'admin' },
      { name: 'user' },
    ];
    // Use findOrCreate to avoid duplicates if the script is run multiple times
    const createdRoles = await Promise.all(
        roles.map(role => Role.findOrCreate({ where: { name: role.name }, defaults: role }))
    );
    createdRoles.forEach(([role, created]) => {
        console.log(`Role '${role.name}' ${created ? 'created.' : 'already exists.'}`);
    });
    const adminRole = await Role.findOne({ where: { name: 'admin' } });
    const userRole = await Role.findOne({ where: { name: 'user' } });

    if (!adminRole || !userRole) {
        throw new Error('Admin or User role could not be found/created.');
    }

    // --- Seed Admin User ---
    console.log('Seeding admin user...');
    const [adminUser, adminCreated] = await User.findOrCreate({
      where: { username: ADMIN_USERNAME },
      defaults: {
        username: ADMIN_USERNAME,
        // Pass the plain password; the model's beforeCreate hook will hash it
        password_hash: ADMIN_PASSWORD,
        role_id: adminRole.id,
      },
    });
    if (adminCreated) {
      console.log(`Admin user '${adminUser.username}' created.`);
      // Note: The password_hash stored will be the hashed version due to the hook.
    } else {
      console.log(`Admin user '${adminUser.username}' already exists.`);
      // Optionally update the admin password if needed, ensuring hashing
      // const salt = await bcrypt.genSalt(10);
      // adminUser.password_hash = await bcrypt.hash(ADMIN_PASSWORD, salt);
      // await adminUser.save();
      // console.log(`Admin user '${adminUser.username}' password updated (if different).`);
    }

    // --- Seed Genres (Optional Example) ---
    console.log('Seeding genres...');
    const genres = [
        { name: 'Action' },
        { name: 'Comedy' },
        { name: 'Drama' },
        { name: 'Sci-Fi' },
        { name: 'Horror' },
        { name: 'Thriller' },
        { name: 'Animation' },
        { name: 'Romance' },
    ];
    const createdGenres = await Promise.all(
        genres.map(genre => Genre.findOrCreate({ where: { name: genre.name }, defaults: genre }))
    );
     createdGenres.forEach(([genre, created]) => {
        console.log(`Genre '${genre.name}' ${created ? 'created.' : 'already exists.'}`);
    });

    console.log('Database seeding completed successfully.');

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1); // Exit with error code
  } finally {
    // Close the database connection
    await sequelize.close();
    console.log('Database connection closed.');
  }
};

// Run the seeding function
seedDatabase();