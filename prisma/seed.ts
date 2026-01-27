import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Generate unique access code for clients
function generateAccessCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function main() {
  console.log("Starting multi-tenant database seed...");

  // Clear existing data
  await prisma.reservationRequest.deleteMany();
  await prisma.apartment.deleteMany();
  await prisma.floor.deleteMany();
  await prisma.project.deleteMany();
  await prisma.domain.deleteMany();
  await prisma.user.deleteMany();
  await prisma.client.deleteMany();

  // Create super admin user
  const hashedAdminPassword = await bcrypt.hash("superadmin123", 10);
  const superAdmin = await prisma.user.create({
    data: {
      email: "superadmin@example.com",
      password: hashedAdminPassword,
      name: "Super Admin",
      role: "SUPER_ADMIN",
      status: "ACTIVE",
    },
  });
  console.log("✓ Created super admin user:", superAdmin.email);

  // Create multiple clients
  const clients = [];
  const clientData = [
    { name: "Prestige Developers", email: "prestige@example.com", city: "Downtown" },
    { name: "Modern Living Co", email: "modern@example.com", city: "Uptown" },
    { name: "Luxury Estates", email: "luxury@example.com", city: "Suburban" },
  ];

  for (const data of clientData) {
    const client = await prisma.client.create({
      data: {
        ...data,
        accessCode: generateAccessCode(),
      },
    });
    clients.push(client);
    console.log(`✓ Created client: ${client.name}`);
    console.log(`  Access Code: ${client.accessCode}`);
  }

  // Create client users (Owners and Agents)
  const prestige = clients[0];
  const hashedPassword1 = await bcrypt.hash("prestige123", 10);
  const owner1 = await prisma.user.create({
    data: {
      email: "owner@prestige.com",
      password: hashedPassword1,
      name: "John Prestige",
      role: "OWNER",
      clientId: prestige.id,
      status: "ACTIVE",
    },
  });
  console.log(`✓ Created owner for ${prestige.name}: ${owner1.email}`);

  const agent1 = await prisma.user.create({
    data: {
      email: "agent@prestige.com",
      password: hashedPassword1,
      name: "Sarah Agent",
      role: "AGENT",
      clientId: prestige.id,
      status: "ACTIVE",
    },
  });
  console.log(`✓ Created agent for ${prestige.name}: ${agent1.email}`);

  const modern = clients[1];
  const hashedPassword2 = await bcrypt.hash("modern123", 10);
  const owner2 = await prisma.user.create({
    data: {
      email: "owner@modern.com",
      password: hashedPassword2,
      name: "Alice Modern",
      role: "OWNER",
      clientId: modern.id,
      status: "ACTIVE",
    },
  });
  console.log(`✓ Created owner for ${modern.name}: ${owner2.email}`);

  // Create projects for Prestige Developers
  const projects = [];
  const projectConfigs = [
    {
      clientId: prestige.id,
      name: "Luxury Residences Downtown",
      slug: "luxury-residences-downtown",
      description: "Premium residential development in the city center",
      location: "Downtown District",
      floorsCount: 10,
    },
    {
      clientId: prestige.id,
      name: "Skyline Towers",
      slug: "skyline-towers",
      description: "Modern luxury apartments with city views",
      location: "Financial District",
      floorsCount: 15,
    },
    {
      clientId: modern.id,
      name: "Urban Living Spaces",
      slug: "urban-living-spaces",
      description: "Contemporary residential community",
      location: "Arts District",
      floorsCount: 8,
    },
  ];

  for (const config of projectConfigs) {
    const project = await prisma.project.create({
      data: config,
    });
    projects.push(project);
    console.log(`✓ Created project: ${project.name} for ${config.clientId === prestige.id ? "Prestige" : "Modern"}`);
  }

  // Create floors and apartments for each project
  const statuses = ["AVAILABLE", "RESERVED", "SOLD"];

  for (const project of projects) {
    let apartmentCount = 0;

    for (let floorNum = 1; floorNum <= Math.min(project.floorsCount, 10); floorNum++) {
      const floor = await prisma.floor.create({
        data: {
          projectId: project.id,
          floorNumber: floorNum,
          label: `Floor ${floorNum}`,
        },
      });

      // Create 6 apartments per floor
      for (let apartNum = 1; apartNum <= 6; apartNum++) {
        const rooms = apartNum <= 2 ? 1 : apartNum <= 4 ? 2 : 3;
        const area = 50 + rooms * 20 + Math.random() * 20;
        const basePrice = 150000 + rooms * 100000;
        const price = basePrice + Math.random() * 50000;
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        await prisma.apartment.create({
          data: {
            projectId: project.id,
            floorId: floor.id,
            number: `${floorNum}${apartNum.toString().padStart(2, "0")}`,
            rooms,
            area: Math.round(area * 10) / 10,
            price: Math.round(price),
            status,
          },
        });
        apartmentCount++;
      }
    }

    console.log(`  └─ Created ${apartmentCount} apartments in ${project.floorsCount} floors`);
  }

  // Create sample reservations
  const prestige1stProject = projects[0];
  const resApart1 = await prisma.apartment.findFirst({
    where: { projectId: prestige1stProject.id },
  });

  if (resApart1) {
    await prisma.reservationRequest.create({
      data: {
        clientId: prestige1stProject.clientId,
        name: "Michael Johnson",
        phone: "+1-555-0123",
        email: "michael@example.com",
        message: "Interested in the 2-bedroom apartment",
        projectId: prestige1stProject.id,
        apartmentId: resApart1.id,
        status: "PENDING",
      },
    });
    console.log("✓ Created sample reservation");
  }

  console.log("\n✅ Seed completed successfully!");
  console.log("\n📋 Test Credentials:");
  console.log("┌─ Super Admin");
  console.log("│  Email: superadmin@example.com");
  console.log("│  Password: superadmin123");
  console.log("├─ Prestige Owner");
  console.log("│  Email: owner@prestige.com");
  console.log("│  Password: prestige123");
  console.log("├─ Prestige Agent");
  console.log("│  Email: agent@prestige.com");
  console.log("│  Password: prestige123");
  console.log("└─ Modern Owner");
  console.log("   Email: owner@modern.com");
  console.log("   Password: modern123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
