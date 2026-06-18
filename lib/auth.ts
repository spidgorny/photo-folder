import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { readFileSync } from "fs";
import { join } from "path";

const JWT_SECRET = process.env.JWT_SECRET || process.env.IRON_PASSWORD!;
const JWT_ISSUER = "photo-folder";
const ACCESS_TOKEN_EXPIRY = "2h"; // Short lived for mobile + web
const REFRESH_TOKEN_EXPIRY = "30d";

if (!JWT_SECRET) {
	throw new Error(
		"JWT_SECRET or IRON_PASSWORD environment variable is required",
	);
}

const secretKey = new TextEncoder().encode(JWT_SECRET);

export interface JWTPayload {
	userId: string;
	email: string;
	allowedPrefixes?: string[];
	role?: "user" | "admin";
	provider?: "google" | "email";
}

export async function signAccessToken(payload: JWTPayload): Promise<string> {
	return new SignJWT({ ...payload })
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setIssuer(JWT_ISSUER)
		.setExpirationTime(ACCESS_TOKEN_EXPIRY)
		.sign(secretKey);
}

export async function signRefreshToken(userId: string): Promise<string> {
	return new SignJWT({ userId })
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setIssuer(JWT_ISSUER)
		.setExpirationTime(REFRESH_TOKEN_EXPIRY)
		.sign(secretKey);
}

export async function verifyToken(token: string): Promise<JWTPayload> {
	try {
		const { payload } = await jwtVerify(token, secretKey, {
			issuer: JWT_ISSUER,
		});
		return payload as unknown as JWTPayload;
	} catch (err) {
		console.error("JWT verification error:", err);
		throw new Error("Invalid or expired token");
	}
}

export async function getTokenFromRequest(
	req: Request,
): Promise<string | null> {
	const authHeader = req.headers.get("authorization");
	if (authHeader?.startsWith("Bearer ")) {
		return authHeader.substring(7);
	}

	// Fallback to cookie for web UI compatibility
	const cookieStore = await cookies();
	const tokenCookie = cookieStore.get("access_token")?.value;
	return tokenCookie || null;
}

export async function getAuthenticatedUser(req: Request): Promise<JWTPayload> {
	const token = await getTokenFromRequest(req);
	if (!token) {
		throw new Error("No authentication token provided");
	}

	const payload = await verifyToken(token);
	return payload;
}

// For backward compatibility with existing VALID_USERS
export function isValidUser(email: string): boolean {
	// Try to read from JSON file first
	try {
		const allowedUsersPath = join(process.cwd(), "allowed-users.json");
		const allowedUsers = JSON.parse(readFileSync(allowedUsersPath, "utf-8"));
		return allowedUsers.includes(email);
	} catch (err) {
		// Fallback to environment variable if file doesn't exist
		const validUsers = process.env.VALID_USERS
			? JSON.parse(process.env.VALID_USERS)
			: [];
		return validUsers.includes(email);
	}
}
