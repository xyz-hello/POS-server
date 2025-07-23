import jwt from 'jsonwebtoken';

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      user_type: user.user_type,
    },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};
