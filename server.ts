import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

import { initializeDatabase } from './backend/db.ts';
import apiRouter from './backend/routes/api.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  try {
    await initializeDatabase();

    const app = express();
    const PORT = Number(process.env.PORT) || 3000;

    app.set('trust proxy', 1);

    app.use(
      helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
        frameguard: false,
      })
    );

    app.use(
      cors({
        origin: true,
        credentials: true,
      })
    );

    app.use(cookieParser());

    app.use(
      express.json({
        limit: '25mb',
      })
    );

    app.use(
      express.urlencoded({
        extended: true,
        limit: '25mb',
      })
    );

    const apiLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 600,
      standardHeaders: true,
      legacyHeaders: false,
      validate: false,
      message: {
        error: 'Too many requests, please try again shortly.',
      },
    });

    app.use('/api', apiLimiter, apiRouter);

    if (process.env.NODE_ENV !== 'production') {
      const vite = await createViteServer({
        server: {
          middlewareMode: true,
        },
        appType: 'spa',
      });

      app.use(vite.middlewares);
    } else {
      const distPath = path.resolve(__dirname, 'dist');

      app.use(express.static(distPath));

      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(
        `A/Galenbindunuwewa Central College Portal running on port ${PORT}`
      );
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
