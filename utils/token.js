import jwt from 'jsonwebtoken';

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      user_type: user.user_type,
      customer_id: user.customer_id,
      username: user.username,
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};
