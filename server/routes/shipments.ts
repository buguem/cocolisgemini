import { Router, Response } from 'express';
import { ShipmentStatus } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

export const shipmentsRouter = Router();

// GET /api/shipments — Liste publique avec filtres
shipmentsRouter.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { origin, destination, category, minPrice, maxPrice, status } = req.query;

    const statusFilter =
      status === 'ALL'
        ? undefined
        : status
          ? (String(status) as ShipmentStatus)
          : undefined;

    const shipments = await prisma.shipment.findMany({
      where: {
        ...(statusFilter ? { status: statusFilter } : { status: { not: 'CANCELLED' } }),
        ...(category ? { category: String(category) } : {}),
        ...(origin
          ? {
              OR: [
                { originCity: { contains: String(origin), mode: 'insensitive' } },
                { originProvince: { contains: String(origin), mode: 'insensitive' } },
              ],
            }
          : {}),
        ...(destination
          ? {
              OR: [
                { destCity: { contains: String(destination), mode: 'insensitive' } },
                { destProvince: { contains: String(destination), mode: 'insensitive' } },
              ],
            }
          : {}),
        ...(minPrice ? { priceCAD: { gte: parseFloat(String(minPrice)) } } : {}),
        ...(maxPrice ? { priceCAD: { lte: parseFloat(String(maxPrice)) } } : {}),
      },
      include: {
        sender: {
          select: { id: true, name: true, rating: true, completedTrips: true, verificationStatus: true },
        },
        _count: { select: { proposals: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ shipments });
  } catch (err) {
    console.error('[GET /shipments]', err);
    res.status(500).json({ error: 'Erreur interne.' });
  }
});

// GET /api/shipments/:id — Détail d'une annonce
shipmentsRouter.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const shipment = await prisma.shipment.findUnique({
      where: { id },
      include: {
        sender: { select: { id: true, name: true, rating: true, completedTrips: true, verificationStatus: true } },
        proposals: {
          include: { driver: { select: { id: true, name: true, rating: true, completedTrips: true } } },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { proposals: true } },
      },
    });
    if (!shipment) {
      res.status(404).json({ error: 'Annonce introuvable.' });
      return;
    }
    res.json({ shipment });
  } catch (err) {
    console.error('[GET /shipments/:id]', err);
    res.status(500).json({ error: 'Erreur interne.' });
  }
});

// POST /api/shipments — Créer une annonce (authentifié)
shipmentsRouter.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      titleFr, titleEn, descriptionFr, descriptionEn, category,
      originCity, originProvince, originName, originLat, originLng, originPostal,
      destCity, destProvince, destName, destLat, destLng, destPostal,
      priceCAD, weightKg, dimensions, vehicleNeededFr, vehicleNeededEn,
      distanceKm, departureDate, flexibleDate, deliveryMode,
    } = req.body;

    if (!titleFr || !originCity || !destCity || !priceCAD) {
      res.status(400).json({ error: 'Champs obligatoires manquants.' });
      return;
    }

    const shipment = await prisma.shipment.create({
      data: {
        titleFr,
        titleEn: titleEn || titleFr,
        descriptionFr: descriptionFr || '',
        descriptionEn: descriptionEn || descriptionFr || '',
        category: category || 'parcel',
        originCity,
        originProvince: originProvince || 'QC',
        originName: originName || originCity,
        originLat: Number(originLat ?? 45.5017),
        originLng: Number(originLng ?? -73.5673),
        originPostal,
        destCity,
        destProvince: destProvince || 'QC',
        destName: destName || destCity,
        destLat: Number(destLat ?? 46.8139),
        destLng: Number(destLng ?? -71.208),
        destPostal,
        priceCAD: Number(priceCAD),
        weightKg: Number(weightKg) || 1,
        dimensions: dimensions || 'N/A',
        vehicleNeededFr: vehicleNeededFr || 'Tout véhicule',
        vehicleNeededEn: vehicleNeededEn || 'Any vehicle',
        distanceKm: Number(distanceKm) || 0,
        departureDate: departureDate ? new Date(departureDate) : new Date(),
        flexibleDate: flexibleDate ?? true,
        deliveryMode: deliveryMode || 'home',
        senderId: req.userId!,
      },
      include: {
        sender: { select: { id: true, name: true, rating: true, completedTrips: true, verificationStatus: true } },
      },
    });
    res.status(201).json({ shipment });
  } catch (err) {
    console.error('[POST /shipments]', err);
    res.status(500).json({ error: 'Erreur interne.' });
  }
});

// PATCH /api/shipments/:id/status — Mettre à jour le statut (expéditeur ou admin)
shipmentsRouter.patch('/:id/status', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { status } = req.body;
    const shipment = await prisma.shipment.findUnique({ where: { id } });
    if (!shipment) {
      res.status(404).json({ error: 'Annonce introuvable.' });
      return;
    }
    if (shipment.senderId !== req.userId && req.userRole !== 'ADMIN') {
      res.status(403).json({ error: 'Non autorisé.' });
      return;
    }
    const updated = await prisma.shipment.update({
      where: { id },
      data: { status: status as ShipmentStatus },
    });
    res.json({ shipment: updated });
  } catch (err) {
    console.error('[PATCH /shipments/:id/status]', err);
    res.status(500).json({ error: 'Erreur interne.' });
  }
});

// DELETE /api/shipments/:id — Supprimer (expéditeur ou admin)
shipmentsRouter.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const shipment = await prisma.shipment.findUnique({ where: { id } });
    if (!shipment) {
      res.status(404).json({ error: 'Annonce introuvable.' });
      return;
    }
    if (shipment.senderId !== req.userId && req.userRole !== 'ADMIN') {
      res.status(403).json({ error: 'Non autorisé.' });
      return;
    }
    await prisma.shipment.delete({ where: { id } });
    res.json({ message: 'Annonce supprimée.' });
  } catch (err) {
    console.error('[DELETE /shipments/:id]', err);
    res.status(500).json({ error: 'Erreur interne.' });
  }
});
