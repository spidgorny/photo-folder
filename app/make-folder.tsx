"use client";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function MakeFolder() {
	const router = useRouter();
	const [showForm, setShowForm] = useState(false);

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
		setShowForm(false);
		router.push(`/${formData.name}`);
	};

	if (!showForm) {
		return (
			<div className="container py-3">
				<button
					onClick={() => setShowForm(true)}
					className="btn btn-primary"
				>
					+ Create Folder
				</button>
			</div>
		);
	}

	return (
		<div className="container py-3">
			<form onSubmit={onSubmit}>
				<div className="d-flex gap-3 justify-content-between">
					<input
						name="name"
						className="form-control"
						placeholder="new folder name"
						required
						autoFocus
					/>
					<button type="submit" className="btn btn-primary">
						Create
					</button>
					<button
						type="button"
						onClick={() => setShowForm(false)}
						className="btn btn-secondary"
					>
						Cancel
					</button>
				</div>
			</form>
		</div>
	);
}
