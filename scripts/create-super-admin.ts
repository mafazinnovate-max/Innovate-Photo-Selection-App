import "dotenv/config";
import readline from "readline";
import bcrypt from "bcryptjs";

import { prisma } from "../lib/prisma";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function ask(question: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(question, resolve);
    });
}

async function main() {
    try {
        const username = (await ask("Super Admin username: ")).trim();
        const password = await ask("Super Admin password: ");

        if (!username || !password) {
            console.error("Username and password are required.");
            return;
        }

        const existingAdmin = await prisma.superAdmin.findUnique({
            where: { username },
        });

        if (existingAdmin) {
            console.error(
                `Super Admin "${username}" already exists.`
            );
            return;
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const superAdmin = await prisma.superAdmin.create({
            data: {
                username,
                passwordHash,
            },
        });

        console.log(
            `Super Admin "${superAdmin.username}" created successfully.`
        );
    } catch (error) {
        console.error("Failed to create Super Admin:", error);
        process.exitCode = 1;
    } finally {
        rl.close();
        await prisma.$disconnect();
    }
}

main();