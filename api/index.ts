import { getApp } from '../src/lambda';
import type { Request, Response } from 'express';

export default async function handler(req: Request, res: Response) {
  // OPTIONS preflight is handled by Vercel headers config — respond immediately
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const app = await getApp();
  app(req, res);
}
