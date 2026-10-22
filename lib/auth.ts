import {
    SignJWT,
    jwtVerify,
    decodeJwt,
} from "jose";

import { prisma } from "@/lib/prisma";

export type AuthSession = {
    role: "superadmin" | "admin";
    adminId?: string;
    studioId?: string;
};

type TokenPayload = AuthSession & {
    authSecretId: string;
};

export async function createAuthToken(
    session: AuthSession,
    authSecretId: string,
    secret: string
) {
    const payload: TokenPayload = {
        ...session,
        authSecretId,
    };

    const secretKey = new TextEncoder().encode(
        secret
    );

    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(secretKey);
}

export async function verifyAuthToken(
    token: string
): Promise<AuthSession | null> {
    try {
        /*
         * Read only the AuthSecret ID from the token.
         *
         * This value is NOT trusted yet. It is only used
         * to find the secret that will verify the JWT.
         */
        const unverifiedPayload = decodeJwt(token);

        if (
            typeof unverifiedPayload.authSecretId !==
            "string"
        ) {
            return null;
        }

        const authSecret =
            await prisma.authSecret.findUnique({
                where: {
                    id: unverifiedPayload.authSecretId,
                },
            });

        if (!authSecret) {
            return null;
        }

        const secretKey = new TextEncoder().encode(
            authSecret.secret
        );

        /*
         * Now verify the JWT using the secret belonging
         * to that specific Admin/SuperAdmin.
         */
        const { payload } = await jwtVerify(
            token,
            secretKey
        );

        if (
            payload.role !== "superadmin" &&
            payload.role !== "admin"
        ) {
            return null;
        }

        /*
         * Make sure the verified token still refers to
         * the same AuthSecret record.
         */
        if (
            payload.authSecretId !==
            authSecret.id
        ) {
            return null;
        }

        /*
         * Make sure the AuthSecret belongs to the same
         * account represented by the verified token.
         */
        if (payload.role === "admin") {
            if (
                typeof payload.adminId !== "string" ||
                authSecret.adminId !==
                    payload.adminId
            ) {
                return null;
            }
        }

        if (payload.role === "superadmin") {
            if (
                authSecret.superAdminId === null
            ) {
                return null;
            }
        }

        return {
            role: payload.role,
            adminId:
                typeof payload.adminId === "string"
                    ? payload.adminId
                    : undefined,
            studioId:
                typeof payload.studioId === "string"
                    ? payload.studioId
                    : undefined,
        };
    } catch {
        return null;
    }
}