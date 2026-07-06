import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Sparkles, ArrowLeft } from "lucide-react";

const search = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: search,
  component: AuthPage,
});

const emailSchema = z.string().email();
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

function AuthPage() {
  const s = Route.useSearch();
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const goAfterLogin = () => nav({ to: s.redirect || "/", replace: true });

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "forgot") {
        emailSchema.parse(email);
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Check your inbox for reset instructions");
        setMode("signin");
        return;
      }
      emailSchema.parse(email);
      passwordSchema.parse(password);

      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Welcome to ShopSphere");
        goAfterLogin();
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in");
        goAfterLogin();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    setLoading(true);
    const res = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (res.error) {
      toast.error("Google sign-in failed");
      setLoading(false);
    } else if (!res.redirected) {
      goAfterLogin();
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden hero-gradient p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-black">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-accent text-accent-foreground">
            <Sparkles className="h-4 w-4" />
          </span>
          ShopSphere
        </Link>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Members save more
          </p>
          <h2 className="mt-3 font-display text-5xl font-black leading-tight tracking-tight">
            Sign in and unlock the shortlist.
          </h2>
          <p className="mt-4 max-w-md text-primary-foreground/70">
            Save what you love, track every order, and get first access to drops before they go
            public.
          </p>
        </div>
        <div className="text-xs text-primary-foreground/50">© {new Date().getFullYear()} ShopSphere</div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>

          {mode === "forgot" ? (
            <>
              <h1 className="font-display text-3xl font-black tracking-tight">Reset password</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter your email and we'll send a reset link.
              </p>
              <form onSubmit={handle} className="mt-8 space-y-4">
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full rounded-full h-11">
                  Send reset link
                </Button>
                <button
                  type="button"
                  className="w-full text-sm text-muted-foreground hover:text-ink"
                  onClick={() => setMode("signin")}
                >
                  Back to sign in
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="font-display text-3xl font-black tracking-tight">
                {mode === "signin" ? "Welcome back" : "Create account"}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {mode === "signin" ? "Sign in to continue shopping." : "It only takes a moment."}
              </p>

              <Tabs value={mode} onValueChange={(v) => setMode(v as "signin" | "signup")} className="mt-6">
                <TabsList className="grid w-full grid-cols-2 rounded-full">
                  <TabsTrigger value="signin" className="rounded-full">
                    Sign in
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="rounded-full">
                    Sign up
                  </TabsTrigger>
                </TabsList>
                <TabsContent value={mode} className="mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={google}
                    disabled={loading}
                    className="mb-4 w-full rounded-full h-11"
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.5-.2-2.2H12v4.2h5.9c-.3 1.4-1 2.5-2.2 3.3v2.7h3.5c2-1.9 3.3-4.7 3.3-8z"/>
                      <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.5-2.7c-1 .7-2.2 1.1-3.8 1.1-2.9 0-5.4-2-6.3-4.6H2.1v2.9C3.9 20.5 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.7 14.1c-.2-.7-.3-1.4-.3-2.1s.1-1.4.3-2.1V7H2.1C1.4 8.5 1 10.2 1 12s.4 3.5 1.1 5l3.6-2.9z"/>
                      <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.6l3.1-3.1C17.5 2.1 15 1 12 1 7.7 1 3.9 3.5 2.1 7l3.6 2.9C6.6 7.4 9.1 5.4 12 5.4z"/>
                    </svg>
                    Continue with Google
                  </Button>

                  <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="h-px flex-1 bg-border" />
                    or continue with email
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <form onSubmit={handle} className="space-y-4">
                    {mode === "signup" && (
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your name"
                          className="mt-1"
                        />
                      </div>
                    )}
                    <div>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <Label>Password</Label>
                        {mode === "signin" && (
                          <button
                            type="button"
                            onClick={() => setMode("forgot")}
                            className="text-xs text-muted-foreground hover:text-ink"
                          >
                            Forgot?
                          </button>
                        )}
                      </div>
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="mt-1"
                      />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full rounded-full h-11">
                      {mode === "signin" ? "Sign in" : "Create account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
