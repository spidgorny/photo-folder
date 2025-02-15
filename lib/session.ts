import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";
import invariant from "@lib/invariant.ts";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
	user?: string;
	validPasswords?: string[];
}

let sessionOptions = {
	password: process.env.IRON_PASSWORD,
	cookieName: process.env.IRON_COOKIE_NAME,
};

export async function getMySession(
	req: NextApiRequest | NextRequest,
	res: NextApiResponse | NextResponse,
) {
	invariant(process.env.IRON_PASSWORD, "IRON_PASSWORD is not defined");
	invariant(process.env.IRON_COOKIE_NAME, "IRON_COOKIE_NAME is not defined");
	return await getIronSession<SessionData>(req, res, sessionOptions);
}

export async function getBackendSession() {
	invariant(process.env.IRON_PASSWORD, "IRON_PASSWORD is not defined");
	invariant(process.env.IRON_COOKIE_NAME, "IRON_COOKIE_NAME is not defined");
	return await getIronSession<SessionData>(await cookies(), sessionOptions);
}
