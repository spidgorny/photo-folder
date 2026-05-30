"use client";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";

export function MakeFolder() {
	const router = useRouter();
	const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		let form = e.target as HTMLFormElement;
		const formData = Object.fromEntries(new FormData(form).entries());
		console.log(formData);

		const response = await fetch("/api/s3/mkdir", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(formData),
		});
		if (!response.ok) {
			throw new Error(response.statusText);
		}
		console.log(await response.json());
		router.push(`/${formData.name}`);
	};

	return (
		<div className="container py-3">
			<form onSubmit={onSubmit}>
				<div className="d-flex gap-3 justify-content-between">
					<input
						name="name"
						className="form-control"
						placeholder="new folder name"
						required
					/>
					<button type="submit" className="btn btn-primary">
						Folder
					</button>
				</div>
			</form>
		</div>
	);
}
