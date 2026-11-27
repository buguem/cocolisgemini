import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { env } from '../lib/env.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

export const authRouter = Router();

const userSelect = {
  id: true,
  email: true,
  name: true,
  phone: true,
  avatarUrl: true,
  role: true,
  rating: true,
  completedTrips: true,
  verificationStatus: true,
  createdAt: true,
};

// POST /api/auth/register
authRouter.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, phone } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: 'email, password et name sont requis.' });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'Cet email est déjà utilisé.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, passwordHash, name, phone },
      select: userSelect,
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      env.jwtSecret,
      { expiresIn: '7d' }
    );

    res.status(201).json({ user, token });
  } catch (err) {
    console.error('[register]', err);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// POST /api/auth/login
authRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'email et password sont requis.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      env.jwtSecret,
      { expiresIn: '7d' }
    );

    const { passwordHash: _, ...safeUser } = user;
    res.json({ user: safeUser, token });
  } catch (err) {
    console.error('[login]', err);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// GET /api/auth/me
authRouter.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: userSelect,
    });
    if (!user) {
      res.status(404).json({ error: 'Utilisateur introuvable.' });
      return;
    }
    res.json({ user });
  } catch (err) {
    console.error('[me]', err);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// PATCH /api/auth/verify
authRouter.patch('/verify', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { phone } = req.body;
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        ...(phone ? { phone: String(phone) } : {}),
        verificationStatus: 'FULLY_VERIFIED',
      },
      select: userSelect,
    });
    res.json({ user });
  } catch (err) {
    console.error('[verify]', err);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

// GET /api/auth/dashboard — Données réelles du tableau de bord utilisateur
authRouter.get('/dashboard', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [sentShipments, driverProposals] = await Promise.all([
      prisma.shipment.findMany({
        where: { senderId: req.userId },
        include: {
          sender: { select: { id: true, name: true, rating: true, completedTrips: true } },
          escrowPayment: {
            select: {
              status: true,
              grossAmountCAD: true,
              platformFeeCAD: true,
              driverPayoutCAD: true,
              deliveryCode: true,
            },
          },
          _count: { select: { proposals: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.proposal.findMany({
        where: { driverId: req.userId },
        include: {
          shipment: {
            include: {
              sender: { select: { id: true, name: true, rating: true, completedTrips: true } },
              escrowPayment: {
                select: {
                  status: true,
                  grossAmountCAD: true,
                  platformFeeCAD: true,
                  driverPayoutCAD: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    let escrowBalanceCAD = 0;
    let totalEarnedCAD = 0;

    for (const prop of driverProposals) {
      if (!prop.isAccepted || !prop.shipment.escrowPayment) continue;
      if (prop.shipment.escrowPayment.status === 'HELD_IN_ESCROW') {
        escrowBalanceCAD += prop.shipment.escrowPayment.driverPayoutCAD;
      } else if (prop.shipment.escrowPayment.status === 'RELEASED_TO_DRIVER') {
        totalEarnedCAD += prop.shipment.escrowPayment.driverPayoutCAD;
      }
    }

    res.json({
      sentShipments,
      driverProposals,
      wallet: {
        escrowBalanceCAD,
        totalEarnedCAD,
      },
    });
  } catch (err) {
    console.error('[GET /auth/dashboard]', err);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});
