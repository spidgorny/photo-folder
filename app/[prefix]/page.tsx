"use client";
import { useParams } from "next/navigation";
import { ListFilesGrid } from "../../components/list-files-grid.tsx";
import "react-sliding-pane/dist/react-sliding-pane.css";
import { MainHeader } from "./main-header.tsx";
import { useClientSession } from "../use-client-session.tsx";
import { DropArea } from "./drop-area.tsx";

export default function Home() {
	const params = useParams();
	const session = useClientSession();
	return (
		<main className="container-fluid">
			<MainHeader />
			{!params?.prefix && <div>???</div>}
			{params?.prefix && (
				<div>
					{session.user && <DropArea prefix={params.prefix as string} />}
					<ListFilesGrid prefix={params.prefix as string} />
				</div>
			)}
		</main>
	);
}
