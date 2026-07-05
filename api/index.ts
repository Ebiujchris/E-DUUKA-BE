import { getApp } from '../src/lambda';
import type { Request, Response } from 'express';

const ALLOWED_ORIGIN = 'https://e-duuka-fe.vercel.app';

export default async function handler(req: Request, res: Response) {
  const origin = req.headers.origin;

  // Set CORS headers for every request
  if (origin === ALLOWED_ORIGIN || !origin) {
    res.setHeader('Access-Control-Allow-Origin', origin ?? ALLOWED_ORIGIN);
  } else {
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Short-circuit OPTIONS preflight immediately
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const app = await getApp();
  app(req, res);
}
