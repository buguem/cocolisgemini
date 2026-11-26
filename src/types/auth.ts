import { Language } from './shipment';

export type UserRole = 'USER' | 'ADMIN';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  phone?: string;
  rating: number;
  completedTrips: number;
  joinedDate: string;
  escrowBalanceCAD: number;
  totalEarnedCAD: number;
  status: 'ACTIVE' | 'SUSPENDED';
}

export interface PlatformMetrics {
  totalGrossVolumeCAD: number;
  totalCommissionsCAD: number; // 8% Cocolis share
  totalEscrowHeldCAD: number;
  totalUsersCount: number;
  activeShipmentsCount: number;
  completedDeliveriesCount: number;
}
