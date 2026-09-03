"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const supabase = createClient();
    const result = mode === "signin"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    setBusy(false);
    if (result.error) {
      setMessage(result.error.message);
      return;
    }
    if (mode === "signup" && !result.data.session) {
      setMessage("Check your email to confirm the account, then sign in.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <Link className="auth-brand" href="/">
          <span className="brand-mark"><i /></span>
          <span><strong>Northstar</strong><small>Trading journal</small></span>
        </Link>
        <span className="kicker">PRIVATE WORKSPACE</span>
        <h1>{mode === "signin" ? "Welcome back." : "Create your workspace."}</h1>
        <p>Securely sync plans, executions, reviews, and performance history.</p>

        <form onSubmit={submit}>
          <label className="field">
            <span className="field-label">Email</span>
            <input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label className="field">
            <span className="field-label">Password</span>
            <input type="password" minLength={8} autoComplete={mode === "signin" ? "current-password" : "new-password"} required value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          {message ? <div className="auth-message">{message}</div> : null}
          <button className="primary-button auth-submit" disabled={busy} type="submit">
            {busy ? "Working…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>
        <button className="auth-switch" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setMessage(""); }}>
          {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
        <Link className="auth-back" href="/">← Return to the preview</Link>
      </section>
    </main>
  );
}
