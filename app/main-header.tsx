"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { useClientSession } from "../components/use-client-session.tsx";
import { MySlidingPane } from "../components/my-sliding-pane.tsx";

export function MainHeader() {
	return (
		<header className="bg-white border-bottom p-3 d-flex justify-content-between align-items-center shadow-sm">
			<h4 className="m-0">
				<Link href="/" className="text-decoration-none text-dark">
					📷 Photo Folder
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
	const session = useClientSession();
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	const signOut = async () => {
		setIsLoggingOut(true);
		try {
			const response = await fetch("/api/auth/logout", {
				method: "POST",
			});
			if (!response.ok) {
				console.warn("Logout may have failed");
			}
			props.onSuccess();
		} finally {
			setIsLoggingOut(false);
		}
	};

	const userEmail = typeof session.user === 'string' ? session.user : '';
	const userInitial = userEmail?.charAt(0)?.toUpperCase() || "U";

	return (
		<div className="d-flex align-items-center gap-2">
			<div
				className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
				style={{ width: "36px", height: "36px", fontSize: "14px" }}
				title={userEmail || "User"}
			>
				{userInitial}
			</div>
			<span className="text-muted small d-none d-md-inline">
				{userEmail || "User"}
			</span>
			<button
				onClick={signOut}
				className="btn btn-outline-danger btn-sm"
				disabled={isLoggingOut}
			>
				{isLoggingOut ? "Signing out..." : "Sign Out"}
			</button>
		</div>
	);
}
