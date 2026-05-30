"use client";
import React, { useState } from "react";
import { handleSubmit } from "./handle-password";

export function PasswordForm({ prefix }: { prefix: string }) {
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isWorking, setIsWorking] = useState(false);

	const run = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError("");
		setIsWorking(true);
		try {
			await handleSubmit(new FormData(e.currentTarget), prefix);
			// Handle successful password submission
			// it should revalidate itself
		} catch (err) {
			setError(err instanceof Error ? err.message : String(err));
		} finally {
			setIsWorking(false);
		}
	};

	return (
		<div className="d-flex align-items-center justify-content-center min-vh-100">
			<form onSubmit={run} className="bg-white p-4 rounded shadow">
				<h2 className="mb-4">Enter Password</h2>
				{error && <p className="text-danger mb-4">{error}</p>}
				<div className="mb-3">
					<label className="form-label">
						Password
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="form-control"
							name="password"
						/>
					</label>
				</div>
				<button
					type="submit"
					className="btn btn-primary w-100"
					disabled={isWorking}
				>
					{isWorking ? "Submitting..." : "Submit"}
				</button>
			</form>
		</div>
	);
}
