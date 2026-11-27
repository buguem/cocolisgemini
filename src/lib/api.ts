import { CanadianProvince, Shipment, ShipmentCategory } from '../types/shipment';
import { UserProfile } from '../types/auth';

const TOKEN_KEY = 'cocolis_jwt';

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // ignore storage errors
  }
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(path, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return data as T;
}

interface ApiUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  phone?: string | null;
  role: 'USER' | 'ADMIN';
  rating: number;
  completedTrips: number;
  createdAt?: string;
}

interface ApiShipment {
  id: string;
  titleFr: string;
  titleEn: string;
  descriptionFr: string;
  descriptionEn: string;
  category: string;
  originCity: string;
  originProvince: string;
  originName: string;
  originLat: number;
  originLng: number;
  originPostal?: string | null;
  destCity: string;
  destProvince: string;
  destName: string;
  destLat: number;
  destLng: number;
  destPostal?: string | null;
  priceCAD: number;
  weightKg: number;
  dimensions: string;
  vehicleNeededFr: string;
  vehicleNeededEn: string;
  distanceKm: number;
  departureDate: string;
  flexibleDate: boolean;
  status: 'AVAILABLE' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  senderId?: string;
  sender?: {
    id: string;
    name: string;
    rating: number;
    completedTrips: number;
  };
}

export interface ApiProposal {
  id: string;
  shipmentId: string;
  driverId: string;
  offerAmountCAD: number;
  travelDate: string;
  driverMessage?: string | null;
  isAccepted: boolean;
  createdAt: string;
  driver: {
    id: string;
    name: string;
    rating: number;
    completedTrips: number;
  };
}

export interface ApiEscrow {
  id: string;
  grossAmountCAD: number;
  platformFeeCAD: number;
  driverPayoutCAD: number;
  status: 'PENDING' | 'HELD_IN_ESCROW' | 'RELEASED_TO_DRIVER' | 'REFUNDED';
  deliveryCode?: string;
}

export interface ApiChatMessage {
  id: string;
  shipmentId: string;
  senderId: string;
  text: string;
  isOfferProposal: boolean;
  proposedPrice?: number | null;
  createdAt: string;
  sender: {
    id: string;
    name: string;
  };
}

export interface DashboardResponse {
  sentShipments: Shipment[];
  driverProposals: Array<{
    id: string;
    offerAmountCAD: number;
    travelDate: string;
    isAccepted: boolean;
    shipment: Shipment;
    escrowStatus?: string;
    driverPayoutCAD?: number;
  }>;
  wallet: {
    escrowBalanceCAD: number;
    totalEarnedCAD: number;
  };
}

export function mapApiUser(u: ApiUser): UserProfile {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    avatarUrl: u.avatarUrl ?? undefined,
    phone: u.phone ?? undefined,
    role: u.role,
    rating: u.rating ?? 5.0,
    completedTrips: u.completedTrips ?? 0,
    joinedDate: u.createdAt ? u.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
    escrowBalanceCAD: u.role === 'ADMIN' ? 12450 : 245,
    totalEarnedCAD: u.role === 'ADMIN' ? 89400 : 1280,
    status: 'ACTIVE',
  };
}

export function mapApiShipment(s: ApiShipment): Shipment {
  return {
    id: s.id,
    title: { fr: s.titleFr, en: s.titleEn },
    description: { fr: s.descriptionFr, en: s.descriptionEn },
    origin: {
      name: s.originName,
      city: s.originCity,
      province: s.originProvince as CanadianProvince,
      lat: s.originLat,
      lng: s.originLng,
      postalCode: s.originPostal ?? undefined,
    },
    destination: {
      name: s.destName,
      city: s.destCity,
      province: s.destProvince as CanadianProvince,
      lat: s.destLat,
      lng: s.destLng,
      postalCode: s.destPostal ?? undefined,
    },
    priceCAD: s.priceCAD,
    weightKg: s.weightKg,
    dimensions: s.dimensions,
    departureDate: s.departureDate.split('T')[0],
    flexibleDate: s.flexibleDate,
    status: s.status === 'CANCELLED' ? 'DELIVERED' : s.status,
    senderId: s.sender?.id ?? s.senderId,
    senderName: s.sender?.name || 'Membre Cocolis',
    senderRating: s.sender?.rating ?? 5.0,
    senderTripsCount: s.sender?.completedTrips ?? 0,
    category: s.category as ShipmentCategory,
    vehicleNeeded: {
      fr: s.vehicleNeededFr,
      en: s.vehicleNeededEn,
    },
    distanceKm: s.distanceKm,
  };
}

export async function loginApi(email: string, password: string): Promise<UserProfile> {
  const data = await apiFetch<{ user: ApiUser; token: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setAuthToken(data.token);
  return mapApiUser(data.user);
}

export async function registerApi(name: string, email: string, password: string): Promise<UserProfile> {
  const data = await apiFetch<{ user: ApiUser; token: string }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  setAuthToken(data.token);
  return mapApiUser(data.user);
}

export async function fetchMeApi(): Promise<UserProfile> {
  const data = await apiFetch<{ user: ApiUser }>('/api/auth/me');
  return mapApiUser(data.user);
}

export async function verifyProfileApi(phone?: string): Promise<UserProfile> {
  const data = await apiFetch<{ user: ApiUser }>('/api/auth/verify', {
    method: 'PATCH',
    body: JSON.stringify({ phone }),
  });
  return mapApiUser(data.user);
}

export async function fetchShipmentsApi(): Promise<Shipment[]> {
  const data = await apiFetch<{ shipments: ApiShipment[] }>('/api/shipments');
  return data.shipments.map(mapApiShipment);
}

export async function createShipmentApi(shipment: Shipment): Promise<Shipment> {
  const data = await apiFetch<{ shipment: ApiShipment }>('/api/shipments', {
    method: 'POST',
    body: JSON.stringify({
      titleFr: shipment.title.fr,
      titleEn: shipment.title.en,
      descriptionFr: shipment.description.fr,
      descriptionEn: shipment.description.en,
      category: shipment.category,
      originCity: shipment.origin.city,
      originProvince: shipment.origin.province,
      originName: shipment.origin.name,
      originLat: shipment.origin.lat,
      originLng: shipment.origin.lng,
      originPostal: shipment.origin.postalCode,
      destCity: shipment.destination.city,
      destProvince: shipment.destination.province,
      destName: shipment.destination.name,
      destLat: shipment.destination.lat,
      destLng: shipment.destination.lng,
      destPostal: shipment.destination.postalCode,
      priceCAD: shipment.priceCAD,
      weightKg: shipment.weightKg,
      dimensions: shipment.dimensions,
      vehicleNeededFr: shipment.vehicleNeeded.fr,
      vehicleNeededEn: shipment.vehicleNeeded.en,
      distanceKm: shipment.distanceKm,
      departureDate: shipment.departureDate,
      flexibleDate: shipment.flexibleDate,
    }),
  });
  return mapApiShipment(data.shipment);
}

export async function deleteShipmentApi(id: string): Promise<void> {
  await apiFetch(`/api/shipments/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export async function updateShipmentStatusApi(
  id: string,
  status: 'AVAILABLE' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED'
): Promise<void> {
  await apiFetch(`/api/shipments/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function createReviewApi(shipmentId: string, rating: number, comment: string): Promise<void> {
  await apiFetch('/api/reviews', {
    method: 'POST',
    body: JSON.stringify({ shipmentId, rating, comment }),
  });
}

export async function fetchShipmentProposalsApi(shipmentId: string): Promise<{
  proposals: ApiProposal[];
  escrow: ApiEscrow | null;
  isSender: boolean;
}> {
  return apiFetch(`/api/proposals/shipment/${encodeURIComponent(shipmentId)}`);
}

export async function submitProposalApi(
  shipmentId: string,
  offerAmountCAD: number,
  travelDate: string,
  driverMessage?: string
): Promise<ApiProposal> {
  const data = await apiFetch<{ proposal: ApiProposal }>('/api/proposals', {
    method: 'POST',
    body: JSON.stringify({ shipmentId, offerAmountCAD, travelDate, driverMessage }),
  });
  return data.proposal;
}

export async function acceptProposalApi(proposalId: string): Promise<{
  escrow: ApiEscrow;
  deliveryCode: string;
}> {
  return apiFetch(`/api/proposals/${encodeURIComponent(proposalId)}/accept`, {
    method: 'PATCH',
  });
}

export async function acceptChatOfferApi(
  shipmentId: string,
  offerAmountCAD: number
): Promise<{ escrow: ApiEscrow; deliveryCode: string }> {
  return apiFetch('/api/proposals/accept-chat-offer', {
    method: 'POST',
    body: JSON.stringify({ shipmentId, offerAmountCAD }),
  });
}

export async function confirmDeliveryApi(
  shipmentId: string,
  deliveryCode: string
): Promise<{ message: string; driverPayoutCAD: number }> {
  return apiFetch('/api/proposals/confirm-delivery', {
    method: 'POST',
    body: JSON.stringify({ shipmentId, deliveryCode }),
  });
}

export async function fetchMessagesApi(shipmentId: string): Promise<ApiChatMessage[]> {
  const data = await apiFetch<{ messages: ApiChatMessage[] }>(
    `/api/messages/${encodeURIComponent(shipmentId)}`
  );
  return data.messages;
}

export async function sendMessageApi(
  shipmentId: string,
  text: string,
  isOfferProposal = false,
  proposedPrice?: number
): Promise<ApiChatMessage> {
  const data = await apiFetch<{ message: ApiChatMessage }>('/api/messages', {
    method: 'POST',
    body: JSON.stringify({ shipmentId, text, isOfferProposal, proposedPrice }),
  });
  return data.message;
}

export async function fetchDashboardApi(): Promise<DashboardResponse> {
  const data = await apiFetch<{
    sentShipments: ApiShipment[];
    driverProposals: Array<{
      id: string;
      offerAmountCAD: number;
      travelDate: string;
      isAccepted: boolean;
      shipment: ApiShipment & { escrowPayment?: { status: string; driverPayoutCAD: number } | null };
    }>;
    wallet: { escrowBalanceCAD: number; totalEarnedCAD: number };
  }>('/api/auth/dashboard');

  return {
    sentShipments: data.sentShipments.map(mapApiShipment),
    driverProposals: data.driverProposals.map((p) => ({
      id: p.id,
      offerAmountCAD: p.offerAmountCAD,
      travelDate: p.travelDate.split('T')[0],
      isAccepted: p.isAccepted,
      shipment: mapApiShipment(p.shipment),
      escrowStatus: p.shipment.escrowPayment?.status,
      driverPayoutCAD: p.shipment.escrowPayment?.driverPayoutCAD,
    })),
    wallet: data.wallet,
  };
}
