const jwt = require('jsonwebtoken');
const prisma = require('./prismaClient');

const JWT_SECRET = process.env.JWT_SECRET || 'chipatala-secret-key';

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true }); // we check it manually below per instructions

    // Explicitly check expiry against server time
    if (decoded.exp * 1000 < Date.now()) {
      return res.status(401).json({ error: 'TOKEN_EXPIRED' });
    }

    // Check RevokedToken blocklist
    const revoked = await prisma.revokedToken.findUnique({
      where: { jti: decoded.jti }
    });

    if (revoked) {
      return res.status(401).json({ error: 'TOKEN_REVOKED' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'INVALID_TOKEN' });
  }
}

module.exports = authMiddleware;
