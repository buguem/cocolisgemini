import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const demoPasswordHash = await bcrypt.hash('cocolis123', 10);

  const sophie = await prisma.user.upsert({
    where: { email: 'sophie.tremblay@cocolis.ca' },
    update: {},
    create: {
      id: 'user-sophie',
      email: 'sophie.tremblay@cocolis.ca',
      passwordHash: demoPasswordHash,
      name: 'Sophie Tremblay',
      phone: '+1 (514) 555-0101',
      role: 'USER',
      rating: 4.9,
      completedTrips: 14,
      verificationStatus: 'FULLY_VERIFIED',
    },
  });

  const marc = await prisma.user.upsert({
    where: { email: 'marc.roy@cocolis.ca' },
    update: {},
    create: {
      id: 'user-marc',
      email: 'marc.roy@cocolis.ca',
      passwordHash: demoPasswordHash,
      name: 'Marc-André Roy',
      phone: '+1 (416) 555-0102',
      role: 'USER',
      rating: 5.0,
      completedTrips: 28,
      verificationStatus: 'FULLY_VERIFIED',
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@cocolis.ca' },
    update: {},
    create: {
      id: 'admin-canada',
      email: 'admin@cocolis.ca',
      passwordHash: demoPasswordHash,
      name: 'Administrateur Cocolis.ca',
      phone: '+1 (514) 555-0199',
      role: 'ADMIN',
      rating: 5.0,
      completedTrips: 120,
      verificationStatus: 'FULLY_VERIFIED',
    },
  });

  const seedShipments = [
    {
      id: 'shipment-1',
      titleFr: "Transport d'un Canapé 3 places vintage",
      titleEn: 'Transport of a 3-seater Vintage Sofa',
      descriptionFr:
        'Cherche un conducteur avec SUV ou camionnette pour livrer un beau canapé vintage de Montréal à la haute-ville de Québec.',
      descriptionEn:
        'Looking for a driver with SUV or pickup truck to deliver a vintage sofa from Montreal to Quebec City.',
      category: 'furniture',
      originCity: 'Montréal',
      originProvince: 'QC',
      originName: 'Plateau-Mont-Royal',
      originLat: 45.5236,
      originLng: -73.5834,
      originPostal: 'H2J 1A1',
      destCity: 'Québec',
      destProvince: 'QC',
      destName: 'Sainte-Foy',
      destLat: 46.7825,
      destLng: -71.2827,
      destPostal: 'G1V 0A4',
      priceCAD: 120,
      weightKg: 45,
      dimensions: '200 x 90 x 85 cm',
      vehicleNeededFr: 'SUV, Fourgonnette ou Camionnette',
      vehicleNeededEn: 'SUV, Minivan or Pickup Truck',
      distanceKm: 253,
      departureDate: new Date('2026-12-05T10:00:00Z'),
      flexibleDate: true,
      senderId: sophie.id,
    },
    {
      id: 'shipment-2',
      titleFr: 'Livraison Télévision OLED 65 pouces',
      titleEn: 'Delivery of 65-inch OLED TV',
      descriptionFr:
        "Télévision fragile emballée dans son carton d'origine avec mousses de protection. À manipuler avec soin.",
      descriptionEn:
        'Fragile TV packed in original box with protective foam. Handle with care.',
      category: 'electronics',
      originCity: 'Toronto',
      originProvince: 'ON',
      originName: 'Downtown Toronto',
      originLat: 43.6532,
      originLng: -79.3832,
      originPostal: 'M5V 2T6',
      destCity: 'Ottawa',
      destProvince: 'ON',
      destName: 'ByWard Market',
      destLat: 45.4275,
      destLng: -75.6924,
      destPostal: 'K1N 9C3',
      priceCAD: 85,
      weightKg: 22,
      dimensions: '160 x 95 x 20 cm',
      vehicleNeededFr: 'Berline avec coffre spacieux ou SUV',
      vehicleNeededEn: 'Sedan with spacious trunk or SUV',
      distanceKm: 450,
      departureDate: new Date('2026-12-08T10:00:00Z'),
      flexibleDate: false,
      senderId: marc.id,
    },
    {
      id: 'shipment-3',
      titleFr: "Transport d'un VTT tout-suspendu",
      titleEn: 'Full-suspension Mountain Bike Transport',
      descriptionFr:
        'Vélo de montagne carbone à transporter de Vancouver à Calgary. Peut être mis sur support de toit ou coffre.',
      descriptionEn:
        'Carbon mountain bike to transport from Vancouver to Calgary. Can be placed on roof rack or trunk.',
      category: 'sports',
      originCity: 'Vancouver',
      originProvince: 'BC',
      originName: 'Kitsilano',
      originLat: 49.2684,
      originLng: -123.1683,
      originPostal: 'V6K 1N1',
      destCity: 'Calgary',
      destProvince: 'AB',
      destName: 'Beltline',
      destLat: 51.0447,
      destLng: -114.0719,
      destPostal: 'T2R 0A1',
      priceCAD: 140,
      weightKg: 14,
      dimensions: '180 x 100 x 40 cm',
      vehicleNeededFr: 'Véhicule avec porte-vélo ou grand coffre',
      vehicleNeededEn: 'Vehicle with bike rack or large trunk',
      distanceKm: 970,
      departureDate: new Date('2026-12-12T10:00:00Z'),
      flexibleDate: true,
      senderId: sophie.id,
    },
    {
      id: 'shipment-4',
      titleFr: "Ensemble de 4 pneus d'hiver montés sur jantes",
      titleEn: 'Set of 4 Winter Tires on Rims',
      descriptionFr:
        "4 pneus d'hiver 17 pouces propres dans des housses individuelles de protection.",
      descriptionEn:
        '4 clean 17-inch winter tires in individual protective bags.',
      category: 'auto',
      originCity: 'Trois-Rivières',
      originProvince: 'QC',
      originName: 'Centre-ville',
      originLat: 46.3432,
      originLng: -72.543,
      originPostal: 'G9A 1T0',
      destCity: 'Montréal',
      destProvince: 'QC',
      destName: 'Rosemont',
      destLat: 45.5469,
      destLng: -73.5772,
      destPostal: 'H1X 2B1',
      priceCAD: 65,
      weightKg: 48,
      dimensions: '70 x 70 x 95 cm',
      vehicleNeededFr: 'Coffre standard avec sièges rabattus',
      vehicleNeededEn: 'Standard trunk with folded seats',
      distanceKm: 140,
      departureDate: new Date('2026-12-06T10:00:00Z'),
      flexibleDate: true,
      senderId: marc.id,
    },
    {
      id: 'shipment-5',
      titleFr: 'Table à manger en érable massif + 4 chaises',
      titleEn: 'Solid Maple Dining Table + 4 Chairs',
      descriptionFr:
        "Table en bois d'érable artisanale démontée (pieds dévissés) + 4 chaises assorties.",
      descriptionEn:
        'Handcrafted solid maple table disassembled (legs unbolted) + 4 matching chairs.',
      category: 'moving',
      originCity: 'Sherbrooke',
      originProvince: 'QC',
      originName: 'Jacques-Cartier',
      originLat: 45.4042,
      originLng: -71.8929,
      originPostal: 'J1J 1X2',
      destCity: 'Gatineau',
      destProvince: 'QC',
      destName: 'Hull',
      destLat: 45.4287,
      destLng: -75.7133,
      destPostal: 'J8X 3X1',
      priceCAD: 110,
      weightKg: 60,
      dimensions: '160 x 90 x 40 cm (démonté)',
      vehicleNeededFr: 'Fourgonnette, Camionnette ou Van',
      vehicleNeededEn: 'Minivan, Pickup Truck or Van',
      distanceKm: 295,
      departureDate: new Date('2026-12-14T10:00:00Z'),
      flexibleDate: false,
      senderId: sophie.id,
    },
  ];

  for (const shipment of seedShipments) {
    await prisma.shipment.upsert({
      where: { id: shipment.id },
      update: {},
      create: shipment,
    });
  }

  console.log(`Seed complete: 3 demo users and ${seedShipments.length} shipments ready in Neon Postgres.`);
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
