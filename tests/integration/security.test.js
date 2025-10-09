const { expect } = require('chai');
const sinon = require('sinon');
const request = require('supertest'); // Import request
const app = require('../../src/app'); // Import app
const { User, Role } = require('../../src/models'); // Import models
const { isBlacklisted } = require('../../src/utils/tokenBlacklist.utils'); // Import isBlacklisted

describe('Security - JWT Secret Key', () => {
  let originalJwtSecret;

  before(() => { // Use before to save the original env var once
    originalJwtSecret = process.env.JWT_SECRET;
  });

  after(() => { // Use after to restore the original env var once
    process.env.JWT_SECRET = originalJwtSecret;
  });

  // Clear the cache before each test in this describe block
  beforeEach(() => {
    delete require.cache[require.resolve('../../src/utils/jwt.utils')];
  });

  it('should throw an error if JWT_SECRET is not defined', () => {
    delete process.env.JWT_SECRET; // Unset for this test
    let error;
    try {
      require('../../src/utils/jwt.utils');
    } catch (e) {
      error = e;
    }
    expect(error).to.be.an('Error');
    expect(error.message).to.include('FATAL ERROR: JWT_SECRET is not defined');
  });

  it('should not throw an error if JWT_SECRET is defined', () => {
    process.env.JWT_SECRET = 'test_secret'; // Set for this test
    let error;
    try {
      require('../../src/utils/jwt.utils');
    } catch (e) {
      error = e;
    }
    expect(error).to.be.undefined;
  });
});

describe('Security - Token Revocation/Blacklisting', () => {
  let userToken;
  let adminToken;
  let normalUser;

  beforeEach(async () => {
    // Ensure JWT_SECRET is set for these tests
    process.env.JWT_SECRET = 'test_secret_for_revocation';
    delete require.cache[require.resolve('../../src/utils/jwt.utils')]; // Reload jwt.utils with the secret

    // Create roles
    const roles = await Role.bulkCreate([{ name: 'user' }, { name: 'admin' }]);
    const adminRole = roles.find(role => role.name === 'admin');
    const userRole = roles.find(role => role.name === 'user');

    // Create users
    await User.create({
      username: 'adminuser',
      password_hash: 'password',
      role_id: adminRole.id
    });

    normalUser = await User.create({
      username: 'normaluser',
      password_hash: 'password',
      role_id: userRole.id
    });

    // Get tokens
    const adminLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: 'adminuser', password: 'password' });
    adminToken = adminLogin.body.token;

    const userLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: 'normaluser', password: 'password' });
    userToken = userLogin.body.token;
  });

  it('should successfully blacklist a token upon logout', async () => {
    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal('Logged out successfully');
    expect(isBlacklisted(userToken)).to.be.true;
  });

  it('should reject a blacklisted token when accessing a protected route', async () => {
    // First, logout the user to blacklist the token
    await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${userToken}`);

    // Then, try to access a protected route with the blacklisted token
    const res = await request(app)
      .get('/api/v1/users') // Assuming /api/v1/users is a protected route
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).to.equal(403);
    expect(res.body.error.message).to.equal('Forbidden: Token has been revoked');
  });
});

describe('Security - Logging', () => {
  let consoleWarnStub;
  let consoleLogStub;
  let userToken;
  let adminToken;
  let normalUser;

  beforeEach(async () => {
    // Stub console.warn and console.log before each test
    consoleWarnStub = sinon.stub(console, 'warn');
    consoleLogStub = sinon.stub(console, 'log');

    // Ensure JWT_SECRET is set for these tests
    process.env.JWT_SECRET = 'test_secret_for_logging';
    delete require.cache[require.resolve('../../src/utils/jwt.utils')]; // Reload jwt.utils with the secret

    // Create roles
    const roles = await Role.bulkCreate([{ name: 'user' }, { name: 'admin' }]);
    const adminRole = roles.find(role => role.name === 'admin');
    const userRole = roles.find(role => role.name === 'user');

    // Create users
    await User.create({
      username: 'adminuser',
      password_hash: 'password',
      role_id: adminRole.id
    });

    normalUser = await User.create({
      username: 'normaluser',
      password_hash: 'password',
      role_id: userRole.id
    });

    // Get tokens
    const adminLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: 'adminuser', password: 'password' });
    adminToken = adminLogin.body.token;

    const userLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: 'normaluser', password: 'password' });
    userToken = userLogin.body.token;
  });

  afterEach(() => {
    // Restore console.warn and console.log after each test
    consoleWarnStub.restore();
    consoleLogStub.restore();
  });

  it('should log unauthorized admin access attempts', async () => {
    await request(app)
      .post('/api/v1/genres') // Admin-only route
      .set('Authorization', `Bearer ${userToken}`) // Use normal user token
      .send({ name: 'New Genre' });

    expect(consoleWarnStub.calledWithMatch(/Unauthorized access attempt: User normaluser \(ID: \d+\) tried to access admin route./)).to.be.true;
  });

  it('should log unauthorized user role access attempts', async () => {
    const res = await request(app)
      .post('/api/v1/reservations')
      .set('Authorization', `Bearer ${adminToken}`) // Admin token
      .send({ showtimeId: 1, seatIds: [1], totalPrice: 10.00 }); // Dummy data

    expect(consoleWarnStub.calledWithMatch(/Unauthorized access attempt: User adminuser \(ID: \d+\) tried to access user-only route without appropriate role./)).to.be.true;
  });

  it('should log token blacklisting upon logout', async () => {
    await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${userToken}`);

    expect(consoleLogStub.calledWithMatch(/Token blacklisted for user: normaluser/)).to.be.true;
  });
});