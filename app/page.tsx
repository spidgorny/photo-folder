"use client";
import { MakeFolder } from "./make-folder.tsx";
import { useClientSession } from "../components/use-client-session.tsx";

export default function Home() {
	const session = useClientSession();
	return (
		<main className="container-fluid">{session.user && <MakeFolder />}</main>
	);
}
