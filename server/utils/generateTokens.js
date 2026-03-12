import jwt from 'jsonwebtoken';

const generateTokens = (res, userId, role) => {
  // Access Token (Short-lived, sent in JSON response)
  const accessToken = jwt.sign({ userId, role }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: '15m', // 15 minutes
  });

  // Refresh Token (Long-lived, sent in httpOnly Cookie)
  const refreshToken = jwt.sign({ userId, role }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d', // 7 days
  });

  res.cookie('jwt', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: process.env.NODE_ENV === 'development' ? 'strict' : 'none', // 'none' required for cross-domain in prod
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return accessToken;
};

export default generateTokens;
