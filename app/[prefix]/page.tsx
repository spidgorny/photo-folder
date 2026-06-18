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
	// const params = useParams();
	// const session = useClientSession();
	// let prefix = params?.prefix as string | undefined;
	const { prefix } = await params;
	const session = await getBackendSession();

	try {
		// const files = await getS3Storage().list(prefix);
		const files = await getThumbnailsFallbackToFiles(prefix);
		invariant(files?.length, "files not found");

		const password = await getPasswordFor(prefix);
		if (password) {
			if (!session.validPasswords?.includes(password)) {
				return <PasswordForm prefix={prefix} />;
			}
		}

		return (
			<main className="container-fluid">
				{!prefix && <div>Loading...</div>}
				{prefix && <ListFilesGrid prefix={prefix} />}
			</main>
		);
	} catch (e) {
		console.error(e);
		return notFound();
	}
}
