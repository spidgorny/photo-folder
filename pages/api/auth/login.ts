import { NextApiRequest, NextApiResponse } from "next";
import invariant from "@/lib/invariant";
import { getMySession } from "@lib/session.ts";

export default async (req: NextApiRequest, res: NextApiResponse) => {
	const jsonValidUsers = process.env.VALID_USERS;
	invariant(jsonValidUsers, "env VALID_USERS not set");
	const validUsers = JSON.parse(jsonValidUsers);
	invariant(validUsers.length, "no valid users defined in array");
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
