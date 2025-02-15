"use client";
import React, { useState } from "react";

export default function PasswordForm({ prefix }: { prefix: string }) {
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await handleSubmit(new FormData(e.target as HTMLFormElement), prefix);
			// Handle successful password submission
			// it should revalidate itself
		} catch (err) {
			setError(err.message);
		}
	};

	return (
		<div className="flex items-center justify-center min-h-screen">
			<form onSubmit={onSubmit} className="bg-white p-6 rounded shadow-md">
				<h2 className="text-2xl mb-4">Enter Password</h2>
				{error && <p className="text-red-500 mb-4">{error}</p>}
				<div className="mb-4">
					<label className="block text-gray-700">Password</label>
					<input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="w-full px-3 py-2 border rounded"
					/>
				</div>
				<button
					type="submit"
					className="w-full bg-blue-500 text-white py-2 rounded"
				>
					Submit
				</button>
			</form>
		</div>
	);
}
