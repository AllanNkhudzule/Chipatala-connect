const jwt = require('jsonwebtoken');
const prisma = require('./prismaClient');

const JWT_SECRET = process.env.JWT_SECRET || 'chipatala-secret-key';

async function authMiddleware(req, res, next) {
  // Bypass authentication for demo purposes
  req.user = { jti: 'demo-session', role: 'user', exp: Math.floor(Date.now() / 1000) + 3600 };
  return next();
}

module.exports = authMiddleware;
