import Image from "next/image";
import { useFiles } from "./use-files.tsx";
import axios from "axios";
import React from "react";

export function SelectedImages(props: {
	prefix: string;
	selectedImages: any[];
}) {
	return (
		<div>
			{props.selectedImages.length > 0 && (
				<div className="position-fixed w-100 bottom-0 border rounded start-0 bg-light p-3 d-flex justify-content-between">
					<div>
						Selected images: {props.selectedImages.length}
						<div>
							{props.selectedImages.map((x) => (
								<Image
									src={x.src}
									width={80}
									height={80}
									alt={x.src}
									key={x.src}
									className="object-cover"
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
	const { mutate, data, error, isLoading } = useFiles(props.prefix);

	const onClick = async () => {
		let keys = props.images.map((x) => x.key);
		console.log(keys);
		await axios.delete("/api/s3/deleteMany", { data: { keys } });
		await mutate();
	};

	return (
		<button className="btn btn-danger" onClick={onClick}>
			Delete
		</button>
	);
}
