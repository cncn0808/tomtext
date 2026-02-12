"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
// import { awsDevClient } from "../service/axios";
import { ApiConstants } from "../utils/ApiConstants";


// SHA-256 -> base64 (temp solution; prefer server-side bcrypt/argon2)
async function sha256Base64(text: string): Promise<string> {
  const enc = new TextEncoder().encode(text);
  const hashBuf = await crypto.subtle.digest("SHA-256", enc);
  const bytes = new Uint8Array(hashBuf);
  let str = "";
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str);
}

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");  // renamed
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const u = username.trim();
    const em = email.trim();
    const pw = password;

    if (!u || !em || !pw) {
      setError("Please fill all fields.");
      return;
    }
    if (pw.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      // Client-side hash to satisfy current Lambda contract
      const password_hash = await sha256Base64(pw);


      // TODO: Implement new signup logic
      console.log("Signup logic needs replacement (AWS removed)");
      const res = { status: 501, data: { message: "Not Implemented" } }; // Mock response

      // const res = await awsDevClient.post(
      //   ApiConstants.SIGNUP,
      //   { username: u, email: em, password_hash },
      //   { headers: { "Content-Type": "application/json" } }
      // );

      if (res.status === 201) {
        router.push("/login");
      } else {
        setError("Signup not implemented yet.");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        (typeof err?.response?.data === "string" ? err.response.data : null) ||
        err?.message ||
        "Sign up failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800/70 rounded-xl p-6 shadow">
        <h1 className="text-2xl font-semibold mb-6">Create an account</h1>
        {error && (
          <div className="mb-4 rounded-md border border-red-700 bg-red-900/40 p-3 text-red-200">
            {error}
          </div>
        )}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm text-slate-300">Username</label>
            <input
              type="text"
              className="w-full rounded-md bg-slate-900 border border-slate-700 p-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm text-slate-300">Email</label>
            <input
              type="email"
              className="w-full rounded-md bg-slate-900 border border-slate-700 p-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm text-slate-300">Password</label>
            <input
              type="password"
              className="w-full rounded-md bg-slate-900 border border-slate-700 p-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength={8}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-emerald-600 hover:bg-emerald-700 p-3 font-semibold disabled:opacity-60"
          >
            {isLoading ? "Creating account..." : "Sign up"}
          </button>
        </form>
        <p className="text-sm text-slate-400 mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-sky-400 hover:underline">Log in</a>.
        </p>
      </div>
    </main>
  );
}
