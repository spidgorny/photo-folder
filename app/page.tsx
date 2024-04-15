"use client";
import { MainHeader } from "./[prefix]/main-header.tsx";
import { MakeFolder } from "./make-folder.tsx";
import { useClientSession } from "./use-client-session.tsx";

export default function Home() {
	const session = useClientSession();
	return (
		<main className="container-fluid">
			<MainHeader />
			{session.user && <MakeFolder />}
		</main>
	);
}
