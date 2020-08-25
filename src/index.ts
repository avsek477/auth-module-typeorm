import "reflect-metadata";
import { app } from './app';
import dotenv from 'dotenv';
import { createConnection } from 'typeorm';

const result = dotenv.config()

if (result.error) {
  throw result.error
}

const start = async () => {
  console.log('Starting auth service...')

  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined.');
  }

  try {
    await createConnection();
    // await conn.runMigrations();
  } catch(err) {
    console.error("Error connecting database", err);
  }

  app.listen(3000, () => {
    console.log('Auth Server listening on port 3000!');
  })
};

start();