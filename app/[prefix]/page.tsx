"use client";
import { useParams } from "next/navigation";
import { ListFilesGrid } from "./list-files-grid.tsx";
import { useClientSession } from "../../components/use-client-session.tsx";
import { DropArea } from "./drop-area.tsx";
import { useFiles, useThumbnails } from "../../components/use-thumbnails.tsx";
import { MySlidingPane } from "@/components/my-sliding-pane.tsx";
import { ManageThumbnails } from "@/app/[prefix]/manage-thumbnails.tsx";

export default function Home() {
	const params = useParams();
	const session = useClientSession();
	let prefix = params?.prefix as string | undefined;
	return (
		<main className="container-fluid">
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
	const { files } = useThumbnails(props.prefix);
	const thumbCount = files.length;

	const { uploads } = useFiles(props.prefix);
	const fileCount = uploads.length;
	return (
		<MySlidingPane
			title="Manage Thumbnails"
			button={
				<div>
					({thumbCount}/{fileCount})
				</div>
			}
		>
			{({ close }) => <ManageThumbnails prefix={props.prefix} close={close} />}
		</MySlidingPane>
	);
}
