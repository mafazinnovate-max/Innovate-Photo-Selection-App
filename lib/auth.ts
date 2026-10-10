import { SignJWT, jwtVerify } from "jose";

export type AuthSession = {
    role: "superadmin" | "admin";
    adminId?: string;
    studioId?: string;
};

const secret = process.env.AUTH_SECRET;

if (!secret) {
    throw new Error("AUTH_SECRET is not configured.");
}

const secretKey = new TextEncoder().encode(secret);

export async function createAuthToken(
    session: AuthSession
) {
    return await new SignJWT(session)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(secretKey);
}

export async function verifyAuthToken(
    token: string
): Promise<AuthSession | null> {
    try {
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