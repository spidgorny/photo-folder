import { Gallery, Image } from "react-grid-gallery";
import { useFiles } from "./use-files";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useClientSession } from "../app/use-client-session.tsx";
import { SelectedImages } from "./selected-images.tsx";

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
		router.push(`/${props.prefix}/lightbox/` + item.key!);
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

			<SelectedImages
				prefix={props.prefix}
				selectedImages={onlySelectedImages}
			/>
		</div>
	);
}
