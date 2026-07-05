import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';

const router = Router();

router.get('/health', async (req: Request, res: Response) => {
  try {
    // Check DB connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      success: true,
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error: any) {
    res.status(503).json({
      success: false,
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message,
    });
  }
});

export default router;
