"use client";
import { useFiles, useThumbnails } from "@components/use-thumbnails.tsx";
import { MySlidingPane } from "@components/my-sliding-pane.tsx";
import { ManageThumbnails } from "@/app/[prefix]/manage-thumbnails.tsx";

export function CountFiles(props: { prefix: string }) {
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
