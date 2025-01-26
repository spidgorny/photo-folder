import NextImage from "next/image";
import { useThumbnails } from "@components/use-thumbnails.tsx";
import axios from "axios";
import React from "react";
import { useSelectedImages } from "@/app/[prefix]/lightbox/[...key]/use-selected-images.tsx";
import { Image } from "@components/react-grid-gallery/src";

export function SelectedImages(props: {
	prefix: string;
	selectedImages: Image[];
}) {
	const { removeBy, clear } = useSelectedImages<Image>();
	return (
		<div>
			{props.selectedImages.length > 0 && (
				<div className="position-fixed w-100 bottom-0 border rounded start-0 bg-dark text-white p-3 d-flex justify-content-between">
					<div>
						Selected images: {props.selectedImages.length}
						<div>
							{props.selectedImages.map((image) => (
								<div
									className="position-relative d-inline-block"
									key={image.key}
								>
									<NextImage
										src={image.src}
										width={80}
										height={80}
										alt={image.alt ?? ""}
										key={image.key}
										className="object-cover border rounded mx-1"
									/>
									<button
										type="button"
										className="position-absolute btn-close bg-white rounded"
										aria-label="Close"
										style={{ top: 0, right: 5 }}
										onClick={() => removeBy((x) => x.key === image.key)}
									/>
								</div>
							))}
						</div>
					</div>
					<div>
						<DeleteButton
							prefix={props.prefix}
							images={props.selectedImages}
							resetSelectedImages={clear}
						/>
					</div>
				</div>
			)}
		</div>
	);
}

function DeleteButton(props: {
	prefix: string;
	images: Image[];
	resetSelectedImages: () => void;
}) {
	const { mutateThumbnails, data, error, isLoading } = useThumbnails(
		props.prefix,
	);

	const onClick = async () => {
		let keys = props.images.map((x) => x.key);
		console.log(keys);
		await axios.delete("/api/s3/deleteMany", { data: { keys } });
		await mutateThumbnails();
		props.resetSelectedImages();
	};

	return (
		<button className="btn btn-danger" onClick={onClick}>
			Delete
		</button>
	);
}
