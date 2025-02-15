"use server";

import { getBackendSession } from "@lib/session.ts";
import { getPasswordFor } from "@/app/api/s3/files/[prefix]/getThumbnailsFallbackToFiles.ts";
import { revalidatePath } from "next/cache";
import invariant from "@/lib/invariant.ts";

export const handleSubmit = async (formData: FormData, prefix: string) => {
	const session = await getBackendSession();
	const correctPassword = await getPasswordFor(prefix);
	console.log(formData);
	const password = formData.get("password") as string;

	invariant(password === correctPassword, "wrong password");
	session.validPasswords = session.validPasswords || [];
	session.validPasswords.push(password);
	await session.save();
	revalidatePath(`/${prefix}`);
};
