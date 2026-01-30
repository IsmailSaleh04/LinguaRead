"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import ErrorMessage from "@/components/common/ErrorMessage";
import { BookOpen } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-cream to-light-bg flex flex-col items-center justify-center p-6">
      <div className="text-center mb-8">
      <div className="flex justify-center mb-4">
        <BookOpen size={48} className="text-orange" />
      </div>
      <h1 className="text-4xl font-bold text-dark mb-2">Welcome Back</h1>
      <p className="text-brown text-lg">Login to continue learning</p>
      </div>
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border-2 border-brown border-opacity-20">
      {error && <ErrorMessage message={error} />}

      <form onSubmit={handleSubmit} className="space-y-6 mt-6">
        <div>
        <label className="block text-sm font-semibold text-dark mb-2">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border-2 border-brown border-opacity-30 rounded-lg 
               focus:outline-none focus:border-brown transition-colors"
          placeholder="you@example.com"
          required
        />
        </div>

        <div>
        <label className="block text-sm font-semibold text-dark mb-2">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 border-2 border-brown border-opacity-30 rounded-lg 
               focus:outline-none focus:border-brown transition-colors"
          placeholder="••••••••"
          required
        />
        </div>

        <Button
        type="submit"
        variant="primary"
        className="w-full"
        size="lg"
        disabled={isLoading}
        >
        {isLoading ? "Logging in..." : "Login"}
        </Button>
      </form>

      <p className="text-center text-brown mt-6">
        Don't have an account?{" "}
        <Link
        href="/register"
        className="text-orange font-semibold hover:underline"
        >
        Sign up
        </Link>
      </p>
      </div>
    </div>
  );
}
