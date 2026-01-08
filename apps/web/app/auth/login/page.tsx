"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const result = await signIn.email({
            email,
            password,
        });

        if (result.error) {
            setError(result.error.message || "Login failed");
            setLoading(false);
            return;
        }

        router.push("/library");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-sm space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl text-foreground">Welcome back</h1>
                    <p className="text-sm text-muted mt-2">Sign in to continue your stories</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <p className="text-sm text-danger text-center">{error}</p>
                    )}

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-surface border border-line text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
                        required
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-surface border border-line text-foreground placeholder:text-muted focus:outline-none focus:border-accent"
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-accent text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <p className="text-center text-sm text-muted">
                    Don't have an account?{" "}
                    <Link href="/auth/signup" className="text-accent hover:underline">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}