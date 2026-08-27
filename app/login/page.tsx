"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function Login() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signup, setSignup] = useState(false);
  const [msg, setMsg] = useState("");

  async function submit() {
    setMsg("");

    if (!supabase) {
      setMsg(
        "Supabase is not configured. Add the project URL and anon key to .env.local."
      );
      return;
    }

    const r = signup
      ? await supabase.auth.signUp({
          email,
          password,
        })
      : await supabase.auth.signInWithPassword({
          email,
          password,
        });

    if (r.error) {
      setMsg(r.error.message);
      return;
    }

    if (signup) {
      setMsg(
        "Account created. Check email if confirmation is enabled."
      );
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <main className="container form">
      <h1>{signup ? "Create account" : "Welcome back"}</h1>

      <p className="muted">
        ForgeAI requires an account to save projects.
      </p>

      {!supabase && (
        <p className="small error">
          Supabase is not configured yet. Add the project URL and anon key to{" "}
          <code>.env.local</code>.
        </p>
      )}

      <input
        className="input"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={!supabase}
      />

      <input
        className="input"
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={!supabase}
      />

      <button
        className="btn"
        onClick={submit}
        disabled={!supabase}
      >
        {signup ? "Sign up" : "Login"}
      </button>

      {msg && <p className="small error">{msg}</p>}

      <p className="small muted">
        <button
          className="btn secondary"
          onClick={() => setSignup(!signup)}
        >
          {signup ? "Have an account? Login" : "New here? Sign up"}
        </button>
      </p>
    </main>
  );
}