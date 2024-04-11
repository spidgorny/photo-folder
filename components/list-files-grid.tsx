import { Gallery, Image } from "react-grid-gallery";
import { useFiles } from "./use-files";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { images } from "next/dist/build/webpack/config/blocks/images";
import { useClientSession } from "../pages/[prefix]/main-header.tsx";
import axios from "axios";

export function ListFilesGrid(props: { prefix: string }) {
	const router = useRouter();
	const session = useClientSession();
	const { data, error, isLoading } = useFiles(props.prefix);

	const images =
		data?.files.map(
			(file) =>
				({
					key: file.key,
					src: `/api/s3/thumb/${file.key}`,
					width: file.metadata?.width,
					height: file.metadata?.height,
					isSelected: false,
					caption: file.key,
					tags: [
						// { value: "Ocean", title: "Ocean" },
						// { value: "People", title: "People" },
					],
					// alt: "Boats (Jeshu John - designerspics.com)",
				}) as Image,
		) ?? [];
	const [selectedImages, setSelectedImages] = useState<Image[]>(images);

	useEffect(() => {
		setSelectedImages(images);
	}, [images.length]);

	const handleSelect = (
		index: number,
		item: Image,
		event: React.MouseEvent<HTMLElement, MouseEvent>,
	) => {
		console.log(index, item);
		const nextImages = selectedImages.map((image, i) =>
			i === index ? { ...image, isSelected: !image.isSelected } : image,
		);
		setSelectedImages(nextImages);
	};

	const onClick = (index: number, item: Image) => {
		router.push(`/${props.prefix}/lightbox/` + encodeURIComponent(item.key!));
	};

	const onlySelectedImages = selectedImages.filter((x) => x.isSelected);

	return (
		<div>
			{error && <div className="alert alert-danger">{error?.message}</div>}
			{!data && <div>loading...</div>}

			{data && (
				<Gallery
					images={selectedImages}
					onSelect={handleSelect}
					onClick={onClick}
					enableImageSelection={session?.user}
				/>
			)}

			{onlySelectedImages.length > 0 && (
				<div className="position-absolute w-100 bottom-0 border rounded left-0 bg-light p-3 d-flex justify-content-between">
					Selected images: {onlySelectedImages.length}
					<DeleteButton prefix={props.prefix} images={onlySelectedImages} />
				</div>
			)}
		</div>
	);
}

function DeleteButton(props: { prefix: string; images: Image[] }) {
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
