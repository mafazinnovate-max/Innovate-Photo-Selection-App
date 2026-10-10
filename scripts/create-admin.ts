import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

async function main() {
    const username = "innovate";

    const password = process.env.INITIAL_ADMIN_PASSWORD;

    if (!password) {
        throw new Error(
            "INITIAL_ADMIN_PASSWORD is not set in your environment."
        );
    }

    const studio = await prisma.studio.findUnique({
        where: {
            id: "innovate-studio",
        },
    });

    if (!studio) {
        throw new Error("Innovate studio was not found.");
    }

    const existingAdmin = await prisma.admin.findUnique({
        where: {
            username,
        },
    });

    if (existingAdmin) {
        console.log(`Admin "${username}" already exists.`);
        return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await prisma.admin.create({
        data: {
            username,
            passwordHash,
            studioId: studio.id,
        },
    });

    console.log(`Admin created successfully: ${admin.username}`);
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });