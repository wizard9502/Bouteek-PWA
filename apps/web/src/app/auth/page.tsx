"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { supabase } from "@/lib/supabaseClient";

export default function AuthPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [referralCode, setReferralCode] = useState("");


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            toast.success("Logged in successfully!");

            // Fetch user role
            const { data: userRecord, error: roleError } = await supabase
                .from('users')
                .select('role')
                .eq('authId', data.user.id)
                .single();

            if (roleError) {
                console.error("Role fetch error:", roleError);
                // Fallback to dashboard if role fetch fails
                router.push("/dashboard");
                return;
            }

            if (userRecord?.role === 'admin') {
                router.push("/admin");
            } else {
                router.push("/dashboard");
            }

        } catch (error: any) {
            toast.error(error.message || "Failed to login");
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        referral_code: referralCode.trim(),
                    },
                },

            });

            if (error) throw error;

            toast.success("Account created! Please check your email to verify (if enabled) or log in.");
            // If email confirmation is disabled, we might be logged in automatically.
            if (data.session) {
                router.push("/dashboard");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to sign up");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
            // No toast needed as it redirects
        } catch (error: any) {
            toast.error(error.message || "Google login failed");
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-black px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-zinc-900 p-8 rounded-2xl shadow-2xl border border-zinc-800">
                <div className="text-center">
                    <img
                        className="mx-auto h-14 w-auto rounded-xl"
                        src="/bouteek-logo.jpg"
                        alt="Bouteek"
                    />
                    <h2 className="mt-6 text-3xl font-black tracking-tight text-white">
                        Welcome to Bouteek
                    </h2>
                    <p className="mt-2 text-sm text-zinc-400">
                        Sign in to manage your store or create a new account.
                    </p>
                </div>

                <div className="space-y-4">
                    <Button
                        variant="outline"
                        type="button"
                        className="w-full h-12 font-bold flex items-center gap-2 bg-white text-black hover:bg-zinc-100 border-none"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : (
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                        )}
                        Continue with Google
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-zinc-700" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-zinc-900 px-2 text-zinc-500">Or continue with email</span>
                        </div>
                    </div>
                </div>

                <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-zinc-800">
                        <TabsTrigger value="login" className="data-[state=active]:bg-bouteek-green data-[state=active]:text-black font-bold">Sign In</TabsTrigger>
                        <TabsTrigger value="signup" className="data-[state=active]:bg-bouteek-green data-[state=active]:text-black font-bold">Sign Up</TabsTrigger>
                    </TabsList>

                    {/* LOGIN FORM */}
                    <TabsContent value="login">
                        <form className="space-y-6 mt-4" onSubmit={handleLogin}>
                            <div>
                                <Label htmlFor="email" className="text-zinc-300">Email address</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="mt-2 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div>
                                <Label htmlFor="password" className="text-zinc-300">Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="mt-2 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                                    placeholder="••••••••"
                                />
                            </div>

                            <Button type="submit" className="w-full h-12 bg-bouteek-green hover:bg-bouteek-green/90 text-black font-black text-sm uppercase tracking-wide" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Sign In
                            </Button>
                        </form>
                    </TabsContent>

                    {/* SIGNUP FORM */}
                    <TabsContent value="signup">
                        <form className="space-y-5 mt-4" onSubmit={handleSignUp}>
                            <div>
                                <Label htmlFor="fullname" className="text-zinc-300">Full Name</Label>
                                <Input
                                    id="fullname"
                                    name="fullname"
                                    type="text"
                                    autoComplete="name"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="mt-2 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                                    placeholder="Mohamed Diallo"
                                />
                            </div>
                            <div>
                                <Label htmlFor="signup-email" className="text-zinc-300">Email address</Label>
                                <Input
                                    id="signup-email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="mt-2 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div>
                                <Label htmlFor="signup-password" className="text-zinc-300">Password</Label>
                                <Input
                                    id="signup-password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="mt-2 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div>
                                <Label htmlFor="referral-code" className="text-zinc-300">Referral Code (Optional)</Label>
                                <Input
                                    id="referral-code"
                                    name="referral_code"
                                    type="text"
                                    placeholder="ENTER-CODE"
                                    value={referralCode}
                                    onChange={(e) => setReferralCode(e.target.value)}
                                    className="mt-2 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                                />
                            </div>

                            <Button type="submit" className="w-full h-12 bg-white hover:bg-zinc-200 text-black font-black text-sm uppercase tracking-wide" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Account
                            </Button>
                        </form>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
