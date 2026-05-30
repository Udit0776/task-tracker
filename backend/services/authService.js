const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const tenantRepository = require('../repositories/tenantRepository');
const { AppError } = require('../middlewares/errorMiddleware');

class AuthService {
  async signup({ name, email, password, role, tenantName, tenantId }) {
    // 1. Check if user already exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError('Email address is already registered.', 400);
    }

    let finalTenantId = tenantId;
    let finalRole = role || 'MEMBER';

    // 2. Resolve Tenant context
    if (tenantName) {
      // Create a brand new tenant organization
      const newTenant = await tenantRepository.create(tenantName);
      finalTenantId = newTenant.id;
      // First user of a new tenant is automatically assigned ADMIN
      finalRole = 'ADMIN';
    } else if (tenantId) {
      // Validate that the specified tenant exists
      const existingTenant = await tenantRepository.findById(tenantId);
      if (!existingTenant) {
        throw new AppError('The specified Organization/Tenant does not exist.', 404);
      }
    } else {
      throw new AppError('Either tenantName (to create a new company) or tenantId (to join an existing one) is required.', 400);
    }

    // 3. Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // 4. Create the User
    const newUser = await userRepository.create({
      tenantId: finalTenantId,
      name,
      email,
      passwordHash,
      role: finalRole
    });

    const tenant = await tenantRepository.findById(finalTenantId);
    const userData = {
      id: newUser.id,
      tenant_id: newUser.tenant_id || newUser.tenantId,
      tenant_name: tenant ? tenant.name : '',
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      created_at: newUser.created_at
    };

    // 5. Sign the Token
    const token = this.generateToken(userData);

    return { token, user: userData };
  }

  async login({ email, password }) {
    // 1. Find user by email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    // 2. Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new AppError('Invalid email or password.', 401);
    }

    const tenant = await tenantRepository.findById(user.tenant_id);
    const userData = {
      id: user.id,
      tenant_id: user.tenant_id,
      tenant_name: tenant ? tenant.name : '',
      name: user.name,
      email: user.email,
      role: user.role
    };

    // 3. Sign the Token
    const token = this.generateToken(userData);

    return { token, user: userData };
  }

  generateToken(user) {
    const payload = {
      userId: user.id,
      tenantId: user.tenant_id || user.tenantId,
      role: user.role,
      name: user.name
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '24h'
    });
  }
}

module.exports = new AuthService();
