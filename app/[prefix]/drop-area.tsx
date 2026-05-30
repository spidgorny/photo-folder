"use client";
import { FileUploader } from "react-drag-drop-files";

export function DropArea(props: { prefix: string }) {
	const fileTypes = ["JPG", "PNG", "GIF"];
	type UploadValue = File | File[];

	const handleChange = (file: UploadValue) => {
		// console.log(file);
		console.log(file);
	};

	const onDrop = async (files: UploadValue) => {
		console.log(files);
		const aFiles = Array.isArray(files) ? files : [files];
		console.log(aFiles);
		let formData = new FormData();
		formData.append("prefix", props.prefix);
		aFiles.forEach((file) => {
			formData.append("file", file);
		});
		console.log(formData);
		const response = await fetch(`/api/s3/upload`, {
			method: "POST",
			body: formData,
		});
		if (!response.ok) {
			throw new Error(response.statusText);
		}
		console.log(response.status);
	};

	return (
		<div className="bg-light py-3">
			<FileUploader
				classes="mx-auto"
				handleChange={handleChange}
				name="file"
				types={fileTypes}
				multiple={true}
				onDrop={onDrop}
				onSelect={onDrop}
			/>
		</div>
	);
}
