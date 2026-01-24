// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';

const server = express();
const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

// Middleware
app.use(cookieParser());

// Global validation
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
  }),
);

// CORS configuration
app.enableCors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow server-to-server or Postman
    if (origin === 'http://localhost:5173' || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
});

// Export server for Vercel serverless
export default server;
