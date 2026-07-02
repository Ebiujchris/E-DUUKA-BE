import { getApp } from '../src/lambda';
import type { Request, Response } from 'express';

export default async function handler(req: Request, res: Response) {
  const app = await getApp();
  app(req, res);
}
