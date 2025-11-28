import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import express from 'express';

const expressApp = express();
let app;

async function createApp() {
  if (!app) {
    app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
    );
    
    app.enableCors({
      origin: [
        'http://localhost:5173',
        /vercel\.app$/,  // Allow all Vercel deployments
      ],
      credentials: true,
    });
    
    await app.init();
  }
  return app;
}

export default async (req, res) => {
  await createApp();
  return expressApp(req, res);
};

