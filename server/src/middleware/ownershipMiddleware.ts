import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';

export const checkAssessmentOwnership = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ data: null, error: 'Unauthorized' });
    }

    const assessment = await prisma.assessment.findUnique({
      where: { id }
    });

    if (!assessment) {
      return res.status(404).json({ data: null, error: 'Assessment not found' });
    }

    if (assessment.patientId !== userId) {
      return res.status(403).json({ data: null, error: 'Access denied. You do not own this assessment.' });
    }

    // Pass the assessment along to avoid querying it again
    (req as any).assessment = assessment;
    next();
  } catch (error) {
    console.error('[checkAssessmentOwnership error]:', error);
    res.status(500).json({ data: null, error: 'Internal server error during ownership check' });
  }
};
