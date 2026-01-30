import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { insertUserSchema } from "@shared/schema";
import { useEffect } from "react";
import { motion } from "framer-motion";

export default function AuthPage() {
    const { user, loginMutation, registerMutation } = useAuth();
    const [, setLocation] = useLocation();

    useEffect(() => {
        if (user) {
            setLocation("/");
        }
    }, [user, setLocation]);

    const formSchema = insertUserSchema.extend({
        password: z.string().min(6, "Password must be at least 6 characters"),
    });

    const loginForm = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            password: "",
            isGuest: false,
        },
    });

    const registerForm = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            password: "",
            isGuest: false,
        },
    });

    function onLogin(data: z.infer<typeof formSchema>) {
        loginMutation.mutate(data);
    }

    function onRegister(data: z.infer<typeof formSchema>) {
        registerMutation.mutate(data);
    }

    function onGuest() {
        setLocation("/");
    }

    if (user) {
        return null; // Redirecting
    }

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100 }
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2 overflow-hidden bg-background">
            {/* Left Side - Form Area */}
            <motion.div
                className="flex items-center justify-center p-8 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50 relative"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                {/* Background Blobs for Vibration */}
                <div className="absolute top-10 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

                <Card className="w-full max-w-md border-0 shadow-2xl bg-white/80 backdrop-blur-xl relative z-10 ring-1 ring-white/60">
                    <CardHeader className="space-y-3 text-center pb-2 pt-8">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <CardTitle className="text-4xl font-bold font-display bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-600 tracking-tight">
                                Welcome
                            </CardTitle>
                        </motion.div>
                        <CardDescription className="text-lg text-muted-foreground/90">
                            Your safe space for connection.
                        </CardDescription>
                    </CardHeader>
                    <div className="px-8 pb-8">
                        <Tabs defaultValue="login" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/40 p-1.5 h-12 rounded-full">
                                <TabsTrigger value="login" className="rounded-full h-9 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm font-medium transition-all">Login</TabsTrigger>
                                <TabsTrigger value="register" className="rounded-full h-9 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm font-medium transition-all">Sign Up</TabsTrigger>
                            </TabsList>

                            <TabsContent value="login" className="mt-0">
                                <Form {...loginForm}>
                                    <form
                                        onSubmit={loginForm.handleSubmit(onLogin)}
                                        className="space-y-5"
                                    >
                                        <FormField
                                            control={loginForm.control}
                                            name="username"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-base font-medium text-foreground/80 pl-1">Username</FormLabel>
                                                    <FormControl>
                                                        <Input className="h-12 bg-white/60 border-muted-foreground/20 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl text-base px-4" placeholder="Enter your username" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={loginForm.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-base font-medium text-foreground/80 pl-1">Password</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="password"
                                                            className="h-12 bg-white/60 border-muted-foreground/20 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl text-base px-4"
                                                            placeholder="Enter your password"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button
                                            type="submit"
                                            className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 transition-all hover:scale-[1.01] rounded-xl mt-2"
                                            disabled={loginMutation.isPending}
                                        >
                                            {loginMutation.isPending ? "Logging in..." : "Login"}
                                        </Button>
                                    </form>
                                </Form>
                            </TabsContent>

                            <TabsContent value="register" className="mt-0">
                                <Form {...registerForm}>
                                    <form
                                        onSubmit={registerForm.handleSubmit(onRegister)}
                                        className="space-y-5"
                                    >
                                        <FormField
                                            control={registerForm.control}
                                            name="username"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-base font-medium text-foreground/80 pl-1">Username</FormLabel>
                                                    <FormControl>
                                                        <Input className="h-12 bg-white/60 border-muted-foreground/20 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl text-base px-4" placeholder="Choose a username" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={registerForm.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-base font-medium text-foreground/80 pl-1">Password</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="password"
                                                            className="h-12 bg-white/60 border-muted-foreground/20 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl text-base px-4"
                                                            placeholder="Create a strong password"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button
                                            type="submit"
                                            className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 transition-all hover:scale-[1.01] rounded-xl mt-2"
                                            disabled={registerMutation.isPending}
                                        >
                                            {registerMutation.isPending
                                                ? "Creating account..."
                                                : "Create Account"}
                                        </Button>
                                    </form>
                                </Form>
                            </TabsContent>
                        </Tabs>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-muted-foreground/15" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase tracking-widest font-medium">
                                <span className="bg-white/60 px-4 text-muted-foreground backdrop-blur-sm rounded-full">
                                    Or
                                </span>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            className="w-full h-12 text-base font-medium border-primary/10 bg-white/50 text-primary hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all rounded-xl"
                            onClick={onGuest}
                        >
                            Continue as Guest
                        </Button>

                        <CardFooter className="flex flex-col gap-2 mt-6 px-0 pb-0">
                            <p className="text-sm text-center text-muted-foreground/70 leading-relaxed font-light">
                                Zero-Info Accounts allow you to Host sessions.
                            </p>
                        </CardFooter>
                    </div>
                </Card>
            </motion.div>

            {/* Right Side - Hero Area */}
            <motion.div
                className="hidden lg:flex flex-col justify-center p-12 bg-gradient-to-br from-primary to-indigo-950 text-white relative overflow-hidden"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            >
                {/* Decorative Elements */}
                <motion.div
                    className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                />

                <motion.div
                    className="max-w-md mx-auto space-y-8 relative z-10"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.h1
                        variants={itemVariants}
                        className="text-5xl font-bold font-display leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-white/70"
                    >
                        Connection without Judgment.
                    </motion.h1>
                    <motion.p
                        variants={itemVariants}
                        className="text-xl text-indigo-100/90 leading-relaxed font-light"
                    >
                        Menti provides a safe, ephemeral space for you to speak, listen, or just be. No history, no tracking, just human connection.
                    </motion.p>

                    <motion.div
                        variants={itemVariants}
                        className="grid grid-cols-2 gap-4 pt-8"
                    >
                        <motion.div
                            whileHover={{ y: -5, backgroundColor: "rgba(255,255,255,0.15)" }}
                            className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 transition-colors cursor-default"
                        >
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-3 text-2xl">🤝</div>
                            <h3 className="font-bold text-white text-lg mb-1">1-on-1 Chat</h3>
                            <p className="text-sm text-indigo-200">Matched by intent. Talk or Listen anonymously.</p>
                        </motion.div>
                        <motion.div
                            whileHover={{ y: -5, backgroundColor: "rgba(255,255,255,0.15)" }}
                            className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 transition-colors cursor-default"
                        >
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-3 text-2xl">👥</div>
                            <h3 className="font-bold text-white text-lg mb-1">Group Sessions</h3>
                            <p className="text-sm text-indigo-200">Themed support rooms. Host or Join community.</p>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </motion.div>
        </div>
    );
}
