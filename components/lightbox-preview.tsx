import Lightbox, { Slide } from "yet-another-react-lightbox";
import { useRouter } from "next/navigation";
import React from "react";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";

import { S3File } from "../lib/s3-file";

export function LightboxPreview(props: {
	prefix: string;
	files: S3File[];
	slides: Slide[];
	fileKey: string;
}) {
	const router = useRouter();
	const index = props?.files?.findIndex((x) => x.key === props.fileKey);

	const thumbnailsRef = React.useRef(null);
	const captionsRef = React.useRef(null);
	const moreProps = {
		thumbnails: { ref: thumbnailsRef },
		captions: { ref: captionsRef },
		plugins: [Thumbnails, Captions],
	};
	return (
		<div>
			<Lightbox
				key={index}
				open={true}
				close={() =>
					router.push(`/${props.prefix}?key=${props.fileKey}#${props.fileKey}`)
				}
				slides={props.slides}
				index={index}
				on={{
					view: ({ index }: { index: number }) => {
						// console.log(index, "/", props.files.length, props.files[index]);
						const indexKey = props.files[index]?.key;
						if (!indexKey) {
							return;
						}
						window.history.replaceState(
							null,
							"",
							`/${props.prefix}/lightbox/${indexKey}`,
						);
					},
				}}
				{...moreProps}
			/>
		</div>
	);
}
