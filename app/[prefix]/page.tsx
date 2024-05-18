"use client";
import { useParams } from "next/navigation";
import { ListFilesGrid } from "../../components/list-files-grid.tsx";
import { MainHeader } from "./main-header.tsx";
import { useClientSession } from "../use-client-session.tsx";
import { DropArea } from "./drop-area.tsx";
import { useFiles } from "../../components/use-files.tsx";
import useSWR from "swr";
import { fetcher } from "../../lib/fetcher.tsx";

export default function Home() {
	const params = useParams();
	const session = useClientSession();
	let prefix = params?.prefix as string | undefined;
	return (
		<main className="container-fluid">
			<MainHeader />
			{!prefix && <div>???</div>}
			{prefix && (
				<div>
					<div className="d-flex justify-content-between">
						<h4>{prefix}</h4>
						{session.user && <DropArea prefix={prefix} />}
						{prefix && <CountFiles prefix={prefix} />}
					</div>
					<ListFilesGrid prefix={prefix} />
				</div>
			)}
		</main>
	);
}

function CountFiles(props: { prefix: string }) {
	const { files } = useFiles(props.prefix);
	const thumbCount = files.length;

	const { data } = useSWR(`/api/s3/uploads?prefix=${props.prefix}`, fetcher);
	const fileCount = data?.files?.length;
	return (
		<div>
			({thumbCount}/{fileCount})
		</div>
	);
}
