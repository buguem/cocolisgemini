import { Router, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

export const messagesRouter = Router();

// GET /api/messages/:shipmentId — Lire les messages d'une annonce
messagesRouter.get('/:shipmentId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const shipmentId = String(req.params.shipmentId);
    const messages = await prisma.message.findMany({
      where: { shipmentId },
      include: { sender: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ messages });
  } catch (err) {
    console.error('[GET /messages/:shipmentId]', err);
    res.status(500).json({ error: 'Erreur interne.' });
  }
});

// POST /api/messages — Envoyer un message
messagesRouter.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { shipmentId, text, isOfferProposal, proposedPrice } = req.body;
    if (!shipmentId || !text) {
      res.status(400).json({ error: 'shipmentId et text sont requis.' });
      return;
    }
    const message = await prisma.message.create({
      data: {
        shipmentId: String(shipmentId),
        senderId: req.userId!,
        text: String(text),
        isOfferProposal: Boolean(isOfferProposal),
        proposedPrice: proposedPrice !== undefined && proposedPrice !== null ? Number(proposedPrice) : null,
      },
      include: { sender: { select: { id: true, name: true } } },
    });
    res.status(201).json({ message });
  } catch (err) {
    console.error('[POST /messages]', err);
    res.status(500).json({ error: 'Erreur interne.' });
  }
});
