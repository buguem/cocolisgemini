import { Router, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

export const proposalsRouter = Router();

// GET /api/proposals/shipment/:shipmentId — Offres et état séquestre d'une annonce
proposalsRouter.get('/shipment/:shipmentId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const shipmentId = String(req.params.shipmentId);
    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: {
        proposals: {
          include: { driver: { select: { id: true, name: true, rating: true, completedTrips: true } } },
          orderBy: { createdAt: 'desc' },
        },
        escrowPayment: true,
      },
    });

    if (!shipment) {
      res.status(404).json({ error: 'Annonce introuvable.' });
      return;
    }

    const canSeeDeliveryCode = shipment.senderId === req.userId || req.userRole === 'ADMIN';
    const escrow = shipment.escrowPayment
      ? {
          id: shipment.escrowPayment.id,
          grossAmountCAD: shipment.escrowPayment.grossAmountCAD,
          platformFeeCAD: shipment.escrowPayment.platformFeeCAD,
          driverPayoutCAD: shipment.escrowPayment.driverPayoutCAD,
          status: shipment.escrowPayment.status,
          deliveryCode: canSeeDeliveryCode ? shipment.escrowPayment.deliveryCode : undefined,
        }
      : null;

    res.json({
      proposals: shipment.proposals,
      escrow,
      isSender: shipment.senderId === req.userId,
    });
  } catch (err) {
    console.error('[GET /proposals/shipment/:shipmentId]', err);
    res.status(500).json({ error: 'Erreur interne.' });
  }
});

// POST /api/proposals/accept-chat-offer — Accepter une offre depuis le chat et créer le séquestre
proposalsRouter.post('/accept-chat-offer', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { shipmentId, offerAmountCAD } = req.body;
    const id = String(shipmentId);
    const amount = Number(offerAmountCAD);

    if (!id || !amount || amount <= 0) {
      res.status(400).json({ error: 'shipmentId et offerAmountCAD valides sont requis.' });
      return;
    }

    const shipment = await prisma.shipment.findUnique({
      where: { id },
      include: { proposals: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });

    if (!shipment) {
      res.status(404).json({ error: 'Annonce introuvable.' });
      return;
    }

    const deliveryCode = Math.floor(100000 + Math.random() * 900000).toString();
    const platformFeeCAD = Math.round(amount * 0.15);
    const driverPayoutCAD = amount - platformFeeCAD;

    const [, escrow] = await prisma.$transaction([
      prisma.shipment.update({ where: { id }, data: { status: 'IN_TRANSIT' } }),
      prisma.escrowPayment.upsert({
        where: { shipmentId: id },
        update: {
          grossAmountCAD: amount,
          platformFeeCAD,
          driverPayoutCAD,
          deliveryCode,
          status: 'HELD_IN_ESCROW',
        },
        create: {
          shipmentId: id,
          stripePaymentIntentId: `pi_simulated_${Date.now()}`,
          grossAmountCAD: amount,
          platformFeeCAD,
          driverPayoutCAD,
          deliveryCode,
          status: 'HELD_IN_ESCROW',
        },
      }),
    ]);

    res.json({ escrow, deliveryCode });
  } catch (err) {
    console.error('[POST /proposals/accept-chat-offer]', err);
    res.status(500).json({ error: 'Erreur interne.' });
  }
});

// POST /api/proposals — Soumettre une offre de transport
proposalsRouter.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { shipmentId, offerAmountCAD, travelDate, driverMessage } = req.body;

    if (!shipmentId || !offerAmountCAD || !travelDate) {
      res.status(400).json({ error: 'shipmentId, offerAmountCAD et travelDate sont requis.' });
      return;
    }

    const shipment = await prisma.shipment.findUnique({ where: { id: String(shipmentId) } });
    if (!shipment) {
      res.status(404).json({ error: 'Annonce introuvable.' });
      return;
    }
    if (shipment.senderId === req.userId) {
      res.status(400).json({ error: 'Vous ne pouvez pas proposer un transport pour votre propre annonce.' });
      return;
    }

    const proposal = await prisma.proposal.create({
      data: {
        shipmentId: String(shipmentId),
        driverId: req.userId!,
        offerAmountCAD: Number(offerAmountCAD),
        travelDate: new Date(travelDate),
        driverMessage,
      },
      include: {
        driver: { select: { id: true, name: true, rating: true, completedTrips: true } },
      },
    });
    res.status(201).json({ proposal });
  } catch (err) {
    console.error('[POST /proposals]', err);
    res.status(500).json({ error: 'Erreur interne.' });
  }
});

// PATCH /api/proposals/:id/accept — Accepter une offre (expéditeur uniquement)
proposalsRouter.patch('/:id/accept', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: { shipment: true },
    });
    if (!proposal) {
      res.status(404).json({ error: 'Offre introuvable.' });
      return;
    }
    if (proposal.shipment.senderId !== req.userId && req.userRole !== 'ADMIN') {
      res.status(403).json({ error: "Seul l'expéditeur peut accepter une offre." });
      return;
    }

    await prisma.$transaction([
      prisma.proposal.update({ where: { id }, data: { isAccepted: true } }),
      prisma.proposal.updateMany({
        where: { shipmentId: proposal.shipmentId, id: { not: id } },
        data: { isAccepted: false },
      }),
      prisma.shipment.update({ where: { id: proposal.shipmentId }, data: { status: 'IN_TRANSIT' } }),
    ]);

    const deliveryCode = Math.floor(100000 + Math.random() * 900000).toString();
    const platformFeeCAD = Math.round(proposal.offerAmountCAD * 0.15);
    const driverPayoutCAD = proposal.offerAmountCAD - platformFeeCAD;

    const escrow = await prisma.escrowPayment.upsert({
      where: { shipmentId: proposal.shipmentId },
      update: {
        grossAmountCAD: proposal.offerAmountCAD,
        platformFeeCAD,
        driverPayoutCAD,
        deliveryCode,
        status: 'HELD_IN_ESCROW',
      },
      create: {
        shipmentId: proposal.shipmentId,
        stripePaymentIntentId: `pi_simulated_${Date.now()}`,
        grossAmountCAD: proposal.offerAmountCAD,
        platformFeeCAD,
        driverPayoutCAD,
        deliveryCode,
        status: 'HELD_IN_ESCROW',
      },
    });

    res.json({ proposal: { ...proposal, isAccepted: true }, escrow, deliveryCode });
  } catch (err) {
    console.error('[PATCH /proposals/:id/accept]', err);
    res.status(500).json({ error: 'Erreur interne.' });
  }
});

// POST /api/proposals/confirm-delivery — Confirmer livraison avec code 6 chiffres
proposalsRouter.post('/confirm-delivery', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { shipmentId, deliveryCode } = req.body;
    const id = String(shipmentId);

    const escrow = await prisma.escrowPayment.findUnique({ where: { shipmentId: id } });
    if (!escrow) {
      res.status(404).json({ error: 'Paiement séquestre introuvable.' });
      return;
    }
    if (escrow.deliveryCode !== String(deliveryCode)) {
      res.status(400).json({ error: 'Code de livraison invalide.' });
      return;
    }

    await prisma.$transaction([
      prisma.escrowPayment.update({
        where: { shipmentId: id },
        data: { status: 'RELEASED_TO_DRIVER' },
      }),
      prisma.shipment.update({
        where: { id },
        data: { status: 'DELIVERED' },
      }),
    ]);

    res.json({ message: 'Livraison confirmée. Fonds libérés au conducteur.', driverPayoutCAD: escrow.driverPayoutCAD });
  } catch (err) {
    console.error('[POST /proposals/confirm-delivery]', err);
    res.status(500).json({ error: 'Erreur interne.' });
  }
});
