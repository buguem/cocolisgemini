import { Router, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

export const reviewsRouter = Router();

// GET /api/reviews/:shipmentId
reviewsRouter.get('/:shipmentId', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const shipmentId = String(req.params.shipmentId);
    const reviews = await prisma.review.findMany({
      where: { shipmentId },
      include: {
        reviewer: { select: { id: true, name: true } },
        reviewed: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ reviews });
  } catch (err) {
    console.error('[GET /reviews/:shipmentId]', err);
    res.status(500).json({ error: 'Erreur interne.' });
  }
});

// POST /api/reviews
reviewsRouter.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { shipmentId, rating, comment } = req.body;
    if (!shipmentId || !rating || !comment) {
      res.status(400).json({ error: 'shipmentId, rating et comment sont requis.' });
      return;
    }

    const shipment = await prisma.shipment.findUnique({ where: { id: String(shipmentId) } });
    if (!shipment) {
      res.status(404).json({ error: 'Annonce introuvable.' });
      return;
    }

    const review = await prisma.review.create({
      data: {
        shipmentId: shipment.id,
        reviewerId: req.userId!,
        reviewedId: shipment.senderId,
        rating: Math.min(5, Math.max(1, Number(rating))),
        comment: String(comment),
      },
      include: {
        reviewer: { select: { id: true, name: true } },
      },
    });
    res.status(201).json({ review });
  } catch (err) {
    console.error('[POST /reviews]', err);
    res.status(500).json({ error: 'Erreur interne.' });
  }
});
