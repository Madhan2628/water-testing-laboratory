import jwt from 'jsonwebtoken';

export const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'wtlms_super_secret_jwt_key_2026_secured',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
};
