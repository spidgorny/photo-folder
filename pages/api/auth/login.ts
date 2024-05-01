import { NextApiRequest, NextApiResponse } from "next";
import { getIronSession } from "iron-session";
import invariant from "tiny-invariant";

export async function getMySession(req: NextApiRequest, res: NextApiResponse) {
	invariant(process.env.IRON_PASSWORD, "IRON_PASSWORD is not defined");
	invariant(process.env.IRON_COOKIE_NAME, "IRON_COOKIE_NAME is not defined");
	const session = await getIronSession<{ user?: string }>(req, res, {
		password: process.env.IRON_PASSWORD,
		cookieName: process.env.IRON_COOKIE_NAME,
	});
	return session;
}

const validUsers = ["depidsvy@gmail.com", "marina2stark@gmail.com"];

export default async (req: NextApiRequest, res: NextApiResponse) => {
	const session = await getMySession(req, res);
	console.log({ session });
	if (validUsers.includes(req.body.email)) {
		session.user = req.body.email;
		await session.save();
		res.status(200).json({ status: "ok" });
	} else {
		res.status(400).json({ status: "login denied" });
	}
};
