require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') }); // Ensure .env is loaded relative to project root
const bcrypt = require('bcrypt');
const { sequelize } = require('../config/database');
const { User, Role } = require('../models'); // Use index.js

const seedAdmin = async () => {
    try {
        await sequelize.sync(); // Ensure tables are created

        // Check if roles exist, create if not
        let userRole = await Role.findOne({ where: { name: 'user' } });
        if (!userRole) {
            userRole = await Role.create({ name: 'user' });
            console.log('Created user role');
        }

        let adminRole = await Role.findOne({ where: { name: 'admin' } });
        if (!adminRole) {
            adminRole = await Role.create({ name: 'admin' });
            console.log('Created admin role');
        }

        // Check if admin user exists
        const adminUsername = process.env.ADMIN_USERNAME || 'admin';
        const adminPassword = process.env.ADMIN_PASSWORD || 'password123'; // Use a default or ensure it's in .env

        const existingAdmin = await User.findOne({ where: { username: adminUsername } });

        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            await User.create({
                username: adminUsername,
                password: hashedPassword,
                role_id: adminRole.id, // Assign admin role ID
            });
            console.log(`Admin user '${adminUsername}' created successfully.`);
        } else {
            console.log(`Admin user '${adminUsername}' already exists.`);
            // Optionally update the admin password if needed, but be careful
            // const hashedPassword = await bcrypt.hash(adminPassword, 10);
            // existingAdmin.password = hashedPassword;
            // await existingAdmin.save();
            // console.log(`Admin user '${adminUsername}' password updated.`);
        }

    } catch (error) {
        console.error('Error seeding admin user:', error);
    } finally {
        // Close the database connection if this script is run standalone
        // await sequelize.close();
    }
};

// Export the function if you intend to call it from elsewhere (e.g., seed.js)
module.exports = seedAdmin;

// If run directly, execute the seeding
if (require.main === module) {
    seedAdmin().then(() => {
        console.log('Admin seeding process finished.');
        // Close connection only if run directly
        sequelize.close();
    });
}
