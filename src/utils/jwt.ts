import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';

export const generateToken = (
  payload: Record<string, unknown>,
  secret: Secret,
  expiresIn: string
): string => {
  return jwt.sign(payload, secret, { expiresIn } as SignOptions);
};

export const verifyToken = (token: string, secret: Secret): JwtPayload => {
  return jwt.verify(token, secret) as JwtPayload;
};
