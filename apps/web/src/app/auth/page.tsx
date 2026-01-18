"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// Initialize client manually here or import from lib if "use client" allows
// Ideally import from lib/supabaseClient but that file might be server-side only depending on env vars exposure.
// Assuming env vars are public.
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");

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
                .eq('id', data.user.id)
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

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div className="text-center">
                    <img
                        className="mx-auto h-12 w-auto rounded-lg"
                        src="/bouteek-logo.jpg"
                        alt="Bouteek"
                    />
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
                        Welcome to Bouteek
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Sign in to manage your store or create a new account.
                    </p>
                </div>

                <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login">Sign In</TabsTrigger>
                        <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    </TabsList>

                    {/* LOGIN FORM */}
                    <TabsContent value="login">
                        <form className="space-y-6 mt-4" onSubmit={handleLogin}>
                            <div>
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="mt-2"
                                />
                            </div>

                            <Button type="submit" className="w-full bg-[#00D632] hover:bg-[#00b829] text-black font-bold" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Sign In
                            </Button>
                        </form>
                    </TabsContent>

                    {/* SIGNUP FORM */}
                    <TabsContent value="signup">
                        <form className="space-y-6 mt-4" onSubmit={handleSignUp}>
                            <div>
                                <Label htmlFor="fullname">Full Name</Label>
                                <Input
                                    id="fullname"
                                    name="fullname"
                                    type="text"
                                    autoComplete="name"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="mt-2"
                                />
                            </div>
                            <div>
                                <Label htmlFor="signup-email">Email address</Label>
                                <Input
                                    id="signup-email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <Label htmlFor="signup-password">Password</Label>
                                <Input
                                    id="signup-password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="mt-2"
                                />
                            </div>

                            <Button type="submit" className="w-full bg-black hover:bg-gray-800 text-white font-bold" disabled={loading}>
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
