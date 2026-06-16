"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { useClientSession } from "../components/use-client-session.tsx";
import { MySlidingPane } from "../components/my-sliding-pane.tsx";

export function MainHeader() {
	return (
		<header className="bg-light p-2 d-flex justify-content-between">
			<h4>
				<Link href="/" className="text-decoration-none text-black">
					Photo Folder (S3)
				</Link>
			</h4>
			<SignInOrOut />
		</header>
	);
}

function SignInOrOut() {
	const session = useClientSession();
	if (session.isLoading) {
		return <div>Loading...</div>;
	}
	if (session.user) {
		return <SignOut onSuccess={() => session.mutate()} />;
	}
	return <SignIn onSuccess={() => session.mutate()} />;
}

function SignIn(props: { onSuccess: () => void }) {
	return (
		<MySlidingPane button="Sign In">
			{({ close }) => (
				<div>
					<div className="mb-3">Sign in with your email (Google account recommended):</div>
					<SignInForm
						onSuccess={() => {
							close();
							props.onSuccess();
						}}
					/>
					<div className="py-4 text-end">
						<button className="btn btn-outline-secondary" onClick={close}>
							Close
						</button>
					</div>
				</div>
			)}
		</MySlidingPane>
	);
}

function SignInForm(props: { onSuccess: () => void }) {
	const [error, setError] = useState<Error | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const signIn = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError(null);
		setIsLoading(true);

		const formData = new FormData(e.currentTarget);
		const email = formData.get("email") as string;

		try {
			const response = await fetch("/api/auth/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email, provider: "email" }),
			});

			if (!response.ok) {
				const errData = await response.json().catch(() => ({}));
				throw new Error(errData.error || response.statusText);
			}

			props.onSuccess();
		} catch (err) {
			console.error(err);
			setError(err instanceof Error ? err : new Error("Sign in failed"));
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<form onSubmit={signIn}>
			<div className="form-floating mb-3">
				<input
					type="email"
					name="email"
					className="form-control"
					id="floatingInput"
					placeholder="name@example.com"
					autoFocus
					disabled={isLoading}
				/>
				<label htmlFor="floatingInput">Your email address</label>
			</div>

			<button 
				className="btn btn-primary w-100 py-2" 
				type="submit"
				disabled={isLoading}
			>
				{isLoading ? "Signing in..." : "Sign In"}
			</button>

			{error && <div className="alert alert-danger mt-3">{error.message}</div>}
			
			<div className="text-muted small mt-4">
				This now uses the new JWT-based authentication system.<br/>
				Use the same email you previously used or any email listed in your VALID_USERS.
			</div>
		</form>
	);
}

function SignOut(props: { onSuccess: () => void }) {
	const signOut = async () => {
		const response = await fetch("/api/auth/logout", {
			method: "POST",
		});
		if (!response.ok) {
			console.warn("Logout may have failed");
		}
		props.onSuccess();
	};

	return (
		<button onClick={signOut} className="btn btn-outline-secondary">
			Sign Out
		</button>
	);
}
