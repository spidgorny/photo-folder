"use client";
import { ListFilesGrid } from "./list-files-grid.tsx";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useClientSession } from "@/components/use-client-session.tsx";
import { PasswordForm } from "@/app/[prefix]/password-form.tsx";
import { useThumbnails } from "@/components/use-thumbnails.tsx";

export default function Home() {
	const params = useParams();
	const prefix = params?.prefix as string;
	const decodedPrefix = prefix ? decodeURIComponent(prefix) : '';
	const { user } = useClientSession();
	const [hasPassword, setHasPassword] = useState(false);
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	// Check if folder has password (this would need an API call)
	// For now, we'll just render the grid if user is authenticated
	useEffect(() => {
		if (user) {
			setIsAuthenticated(true);
		}
	}, [user]);

	// Only fetch thumbnails if user is authenticated
	const { data, error, isLoading } = useThumbnails(isAuthenticated ? decodedPrefix : null);

	if (!isAuthenticated) {
		return <div className="p-8 text-center">Please log in to view this folder.</div>;
	}

	if (isLoading) {
		return <div className="p-8 text-center">Loading...</div>;
	}

	if (error) {
		return <div className="p-8 text-center text-danger">Error loading files: {error.message}</div>;
	}

	if (hasPassword && !isAuthenticated) {
		return <PasswordForm prefix={decodedPrefix} />;
	}

	return (
		<main className="container-fluid">
			{!decodedPrefix && <div>Loading...</div>}
			{decodedPrefix && <ListFilesGrid prefix={decodedPrefix} />}
		</main>
	);
}
