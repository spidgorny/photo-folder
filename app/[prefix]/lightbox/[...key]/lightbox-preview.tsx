import Lightbox, { Slide } from "yet-another-react-lightbox";
import { useRouter } from "next/navigation";
import React from "react";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";

import { S3File } from "@/lib/s3-file.ts";
import { useKeyStroke } from "@react-hooks-library/core";
import { useSelectedImages } from "@/app/[prefix]/lightbox/[...key]/use-selected-images.tsx";

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
	const { list: selectedImages, push } = useSelectedImages<string>();
	useKeyStroke(["Backspace", "Delete", "d", "D", "x", "X"], (e) => {
		e.preventDefault();
		console.log("Del", props.fileKey);
		push(props.fileKey);
	});

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
						let newUrl = `/${props.prefix}/lightbox/${indexKey}`;
						window.history.replaceState(
							{ ...window.history.state, as: newUrl, url: newUrl },
							"",
							newUrl,
						);
					},
				}}
				{...moreProps}
			/>
		</div>
	);
}
