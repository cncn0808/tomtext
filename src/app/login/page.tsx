// app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
// import { awsDevClient } from "../service/axios";
import { ApiConstants } from "../utils/ApiConstants";

// SHA-256 -> base64 (to match your Lambda’s password_hash)
async function sha256Base64(text: string): Promise<string> {
  const enc = new TextEncoder().encode(text);
  const hashBuf = await crypto.subtle.digest("SHA-256", enc);
  const bytes = new Uint8Array(hashBuf);
  let str = "";
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str);
}

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username || !password) {
      setError("Please enter username and password.");
      return;
    }

    setLoading(true);
    try {
      const password_hash = await sha256Base64(password);
      const body = { username, password_hash };
      console.log("Login logic needs replacement (AWS removed)");
      const res = { status: 501, data: { message: "Not Implemented" } }; // Mock

      /*
      const res = await awsDevClient.post(
        ApiConstants.LOGIN, 
        body,
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("res: ", res);

      const token: string | undefined =
        res?.data?.token ?? res?.data?.jwt ?? res?.data?.accessToken;

      if (!token)
        throw new Error(res?.data?.message ?? "Token missing in response.");

      // Store token locally and set default Authorization header
      localStorage.setItem("jwt", token);
      awsDevClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      router.push("/"); // redirect to main app
      */
      setError("Login not implemented yet.");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        (typeof err?.response?.data === "string" ? err.response.data : null) ||
        err?.message ||
        "Login failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800/70 rounded-xl p-6 shadow">
        <h1 className="text-2xl font-semibold mb-6">Log in</h1>
        {error && (
          <div className="mb-4 rounded-md border border-red-700 bg-red-900/40 p-3 text-red-200">
            {error}
          </div>
        )}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm text-slate-300">
              Username
            </label>
            <input
              type="text"
              className="w-full rounded-md bg-slate-900 border border-slate-700 p-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm text-slate-300">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded-md bg-slate-900 border border-slate-700 p-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              minLength={8}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-sky-600 hover:bg-sky-700 p-3 font-semibold disabled:opacity-60"
          >
            {isLoading ? "Signing in..." : "Log in"}
          </button>
        </form>
        <p className="text-sm text-slate-400 mt-4">
          Don’t have an account?{" "}
          <a href="/signup" className="text-sky-400 hover:underline">
            Sign up
          </a>
          .
        </p>
      </div>
    </main>
  );
}
