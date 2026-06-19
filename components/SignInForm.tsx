"use client";
import { useState, FormEvent } from 'react';

interface SignInFormProps {
  onSuccess: () => void;
}

export function SignInForm({ onSuccess }: SignInFormProps) {
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

      onSuccess();
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
    </form>
  );
}
