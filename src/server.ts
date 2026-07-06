import { Server } from 'http';
import app from './app';
import config from './config';
import prisma from './shared/prisma';

let server: Server;

async function main() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    server = app.listen(config.port, () => {
      console.log(`🚀 RentNest server is running on port ${config.port}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server', err);
  }
}

main();

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection, shutting down...', err);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received');
  if (server) server.close();
});
