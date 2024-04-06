import { Gallery, Image } from "react-grid-gallery";
import { useFiles } from "./use-files";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { images } from "next/dist/build/webpack/config/blocks/images";

export function ListFilesGrid(props: { prefix: string }) {
	const router = useRouter();
	const { data, error, isLoading } = useFiles(props.prefix);
	const [selectedImages, setSelectedImages] = useState([]);

	if (error) return <div className="alert alert-danger">{error?.message}</div>;
	if (!data) return <div>loading...</div>;

	const images = data.files.map((file) => ({
		key: file.key,
		src: `/api/s3/thumb/${file.key}`,
		width: file.metadata.width,
		height: file.metadata.height,
		isSelected: false,
		caption: file.key,
		tags: [
			// { value: "Ocean", title: "Ocean" },
			// { value: "People", title: "People" },
		],
		// alt: "Boats (Jeshu John - designerspics.com)",
	}));

	const handleSelect = (
		index: number,
		item: Image,
		event: React.MouseEvent<HTMLElement, MouseEvent>,
	) => {
		const nextImages = selectedImages.map((image, i) =>
			i === index ? { ...image, isSelected: !image.isSelected } : image,
		);
		setSelectedImages(nextImages);
	};

	const onClick = (index: number, item: Image) => {
		router.push(`/${props.prefix}/lightbox/` + encodeURIComponent(item.key));
	};

	return <Gallery images={images} onSelect={handleSelect} onClick={onClick} />;
}
