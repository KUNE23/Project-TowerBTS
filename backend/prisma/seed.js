import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/utils/password.js";

const prisma = new PrismaClient();

const users = [
  {
    name: "Teknisi BTSense",
    email: "technician@btsense.com",
    password: "password",
    role: "technician",
    phone: "+62 812 1000 0001",
  },
  {
    name: "Supervisor BTSense",
    email: "supervisor@btsense.com",
    password: "password",
    role: "supervisor",
    phone: "+62 812 1000 0002",
  },
];

const main = async () => {
  for (const user of users) {
    const password = await hashPassword(user.password);

    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        password,
        role: user.role,
        phone: user.phone,
      },
      create: {
        name: user.name,
        email: user.email,
        password,
        role: user.role,
        phone: user.phone,
      },
    });
  }

  console.log("Seed akun selesai:");
  users.forEach((user) => {
    console.log(`- ${user.role}: ${user.email} / ${user.password}`);
  });
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
