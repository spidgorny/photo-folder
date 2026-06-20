"use server";
import { ListFilesGrid } from "./list-files-grid.tsx";
import { getBackendSession } from "@/lib/session.ts";
import invariant from "@/lib/invariant.ts";
import { notFound } from "next/navigation";
import {
	getPasswordFor,
	getThumbnailsFallbackToFiles,
} from "@/app/api/s3/files/[prefix]/getThumbnailsFallbackToFiles.ts";
import { PasswordForm } from "@/app/[prefix]/password-form.tsx";

export default async function Home({
	params,
}: {
	params: Promise<{ prefix: string }>;
}) {
	const { prefix } = await params;
	const decodedPrefix = decodeURIComponent(prefix);
	const session = await getBackendSession();

	try {
		const files = await getThumbnailsFallbackToFiles(decodedPrefix);
		invariant(files?.length, "files not found");

		const password = await getPasswordFor(decodedPrefix);
		if (password) {
			if (!session.validPasswords?.includes(password)) {
				return <PasswordForm prefix={decodedPrefix} />;
			}
		}

		return (
			<main className="container-fluid">
				{!decodedPrefix && <div>Loading...</div>}
				{decodedPrefix && <ListFilesGrid prefix={decodedPrefix} />}
			</main>
		);
	} catch (e) {
		console.error(e);
		return notFound();
	}
}
