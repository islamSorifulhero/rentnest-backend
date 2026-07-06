import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  database_url: process.env.DATABASE_URL,
  jwt: {
    access_secret: process.env.JWT_ACCESS_SECRET as string,
    refresh_secret: process.env.JWT_REFRESH_SECRET as string,
    access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN || '7d',
    refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  bcrypt_salt_rounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 12,
  admin: {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  },
  stripe: {
    secret_key: process.env.STRIPE_SECRET_KEY as string,
    webhook_secret: process.env.STRIPE_WEBHOOK_SECRET as string,
    success_url: process.env.CLIENT_SUCCESS_URL as string,
    cancel_url: process.env.CLIENT_CANCEL_URL as string,
  },
};
