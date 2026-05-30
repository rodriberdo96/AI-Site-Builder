import express, { Request, Response } from 'express';
import 'dotenv/config';
import cors from 'cors';
import { auth } from './lib/auth.js';
import { toNodeHandler } from 'better-auth/node';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { createRateLimiter, securityHeaders } from './middleware/security.js';
import { projectsRouter } from './routes/projects.js';
import { publicRouter } from './routes/public.js';
import { env } from './config/env.js';

const app = express();

const port = env.port;
const trustedOrigins = env.trustedOrigins;

const corsOptions: cors.CorsOptions = {
    origin(origin, callback) {
        if (!origin || trustedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error('Origin is not allowed by CORS'));
    },
    credentials : true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}

if (env.nodeEnv === 'production') app.set('trust proxy', 1);
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(createRateLimiter({ windowMs: 60_000, max: 120 }));

app.all('/api/auth/{*any}', toNodeHandler(auth));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));

app.get('/', (_req: Request, res: Response) => {
    res.send('Server is Live!');
});

app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
});

app.use('/api/projects', projectsRouter);
app.use('/api/public', publicRouter);
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
