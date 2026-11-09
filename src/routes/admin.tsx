import { createFileRoute } from "@tanstack/react-router";
import type { User } from "@supabase/supabase-js";
import { useEffect, useState, type FormEvent } from "react";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin — SHREE JI" },
      { name: "description", content: "SHREE JI store admin: orders, sales and products." },
      { property: "og:title", content: "Admin — SHREE JI" },
      { property: "og:description", content: "SHREE JI store admin: orders, sales and products." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      if (data.user) {
        const { data: ok } = await supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
        setIsAdmin(!!ok);
      } else setIsAdmin(false);
      setReady(true);
    };
    check();
    const { data: sub } = supabase.auth.onAuthStateChange((ev) => {
      if (ev === "SIGNED_IN" || ev === "SIGNED_OUT" || ev === "USER_UPDATED") setTimeout(check, 0);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = () => supabase.auth.signOut();

  if (!ready) return <p className="py-24 text-center font-serif text-muted-foreground">Loading…</p>;
  if (!user) return <AdminLogin />;
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <p className="font-serif text-2xl">No admin access</p>
        <p className="mt-3 text-muted-foreground">{user.email} is not the store admin account.</p>
        <button onClick={signOut} className="mt-6 rounded-full border-2 border-primary px-8 py-3 font-serif uppercase tracking-widest">Sign out</button>
      </div>
    );
  }
  return <AdminDashboard email={user.email ?? ""} onSignOut={signOut} />;
}

function AdminLogin() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") ?? "").trim();
    const password = String(f.get("password") ?? "");
    setBusy(true);
    setMsg("");
    const { data, error } =
      mode === "in"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/admin` } });
    setBusy(false);
    if (error) setMsg(error.message);
    else if (mode === "up" && !data.session) setMsg("Check your email and tap the confirmation link, then sign in here.");
  };

  const google = async () => {
    setMsg("");
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/admin` });
    if (res.error) setMsg(res.error.message ?? "Google sign-in failed");
  };

  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <h1 className="text-center font-serif text-3xl tracking-[0.12em]">ADMIN</h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">Sign in with the store admin account</p>
      <button onClick={google} className="mt-8 flex h-12 w-full items-center justify-center gap-3 rounded-full border border-border bg-background font-medium">
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>
        Continue with Google
      </button>
      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
      <form onSubmit={onSubmit} className="space-y-3">
        <input name="email" type="email" required placeholder="Email" autoComplete="email" className="h-12 w-full rounded-xl border border-input bg-background px-4 outline-none focus:border-ring" />
        <input name="password" type="password" required minLength={6} placeholder="Password" autoComplete={mode === "in" ? "current-password" : "new-password"} className="h-12 w-full rounded-xl border border-input bg-background px-4 outline-none focus:border-ring" />
        {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
        <button disabled={busy} className="h-12 w-full rounded-full bg-primary font-serif uppercase tracking-[0.15em] text-primary-foreground disabled:opacity-60">
          {busy ? "Please wait…" : mode === "in" ? "Sign in" : "Create account"}
        </button>
      </form>
      <button onClick={() => setMode(mode === "in" ? "up" : "in")} className="mt-4 w-full text-center text-sm text-muted-foreground underline">
        {mode === "in" ? "First time? Create the admin account" : "Already have an account? Sign in"}
      </button>
    </div>
  );
}
