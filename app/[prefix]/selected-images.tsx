import Image from "next/image";
import { useThumbnails } from "../../components/use-thumbnails.tsx";
import axios from "axios";
import React from "react";

export function SelectedImages(props: {
	prefix: string;
	selectedImages: string[];
}) {
	return (
		<div>
			{props.selectedImages.length > 0 && (
				<div className="position-fixed w-100 bottom-0 border rounded start-0 bg-dark text-white p-3 d-flex justify-content-between">
					<div>
						Selected images: {props.selectedImages.length}
						<div>
							{props.selectedImages.map((x) => (
								<Image
									src={x}
									width={80}
									height={80}
									alt={x}
									key={x}
									className="object-cover border rounded mx-1"
								/>
							))}
						</div>
					</div>
					<div>
						<DeleteButton prefix={props.prefix} images={props.selectedImages} />
					</div>
				</div>
			)}
		</div>
	);
}

function DeleteButton(props: { prefix: string; images: any[] }) {
	const { mutateThumbnails, data, error, isLoading } = useThumbnails(
		props.prefix,
	);

	const onClick = async () => {
		let keys = props.images.map((x) => x.key);
		console.log(keys);
		await axios.delete("/api/s3/deleteMany", { data: { keys } });
		await mutateThumbnails();
	};

	return (
		<button className="btn btn-danger" onClick={onClick}>
			Delete
		</button>
	);
}
