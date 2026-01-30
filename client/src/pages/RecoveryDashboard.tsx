import { useQuery, useMutation } from "@tanstack/react-query";
import { RecoveryProfile, StepProgress } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ShieldAlert, Award, RefreshCw, CheckCircle, Circle, HeartHandshake } from "lucide-react";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function RecoveryDashboard() {
    const { toast } = useToast();
    const { user, isLoading: authLoading } = useAuth();
    const [, setLocation] = useLocation();

    // Protect Route
    if (!authLoading && (!user || user.isGuest)) {
        setLocation("/auth");
        return null; // or loading spinner
    }

    const { data: profile, isLoading: profileLoading } = useQuery<RecoveryProfile & { badge?: string, stats?: { count: number, average: number } }>({
        queryKey: ["/api/recovery/profile"],
        enabled: !!user && !user.isGuest
    });

    const { data: steps, isLoading: stepsLoading } = useQuery<StepProgress[]>({
        queryKey: ["/api/recovery/steps"],
    });

    const resetMutation = useMutation({
        mutationFn: async () => {
            await apiRequest("POST", "/api/recovery/reset");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/recovery/profile"] });
            toast({
                title: "Clock Reset",
                description: "It's okay. Relapse is part of recovery. We're here for you.",
            });
        },
    });

    if (profileLoading || stepsLoading) {
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-blue-600">
                            Recovery Community
                        </h1>
                        <p className="text-muted-foreground">
                            Welcome back, <span className="font-semibold text-foreground">{profile?.pseudonym}</span>
                        </p>
                    </div>
                    <Button variant="destructive" className="gap-2 shadow-lg hover:shadow-red-200">
                        <ShieldAlert className="w-4 h-4" /> SOS: Emergency Support
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Sobriety Clock */}
                    <Card className="col-span-1 border-teal-100 bg-gradient-to-br from-white to-teal-50/30">
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center">
                                Sobriety Clock
                                <RefreshCw
                                    className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-red-500 transition-colors"
                                    onClick={() => {
                                        if (confirm("Are you sure you want to reset your sobriety clock?")) {
                                            resetMutation.mutate();
                                        }
                                    }}
                                />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-center py-8">
                            <div className="text-4xl font-bold font-mono tracking-tight text-teal-700">
                                {profile?.soberSince ? formatDistanceToNow(new Date(profile.soberSince)) : '0 days'}
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">Sober Since</p>
                        </CardContent>
                    </Card>

                    {/* Milestones / Coins */}
                    <Card className="col-span-1 md:col-span-2">
                        <CardHeader><CardTitle>Milestones</CardTitle></CardHeader>
                        <CardContent>
                            <div className="flex gap-4 overflow-x-auto pb-2">
                                {/* Mock Coins for now */}
                                {['24h', '1w', '1m', '3m', '6m', '1y'].map((label, i) => (
                                    <div key={label} className={`flex flex-col items-center gap-2 min-w-[80px] opacity-${i < 2 ? '100' : '40'}`}>
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-200 to-amber-500 border-4 border-yellow-100 flex items-center justify-center shadow-lg">
                                            <Award className="text-white w-8 h-8" />
                                        </div>
                                        <span className="text-xs font-bold">{label}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Service Badge & Stats */}
                    <Card className="col-span-1 border-blue-100 bg-gradient-to-br from-white to-blue-50/30">
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center">
                                Service Rank
                                <Badge variant="outline" className="bg-white/80">{profile?.badge || 'None'}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-center py-6 space-y-4">
                            <div className="flex flex-col items-center">
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center border-4 shadow-xl mb-3 ${profile?.badge === 'Recovery Anchor' ? 'bg-purple-100 border-purple-200 text-purple-600' :
                                    profile?.badge === 'Consistent Companion' ? 'bg-blue-100 border-blue-200 text-blue-600' :
                                        profile?.badge === 'Willing Heart' ? 'bg-teal-100 border-teal-200 text-teal-600' :
                                            'bg-gray-50 border-gray-200 text-gray-400'
                                    }`}>
                                    <HeartHandshake className="w-10 h-10" />
                                </div>
                                <h3 className="font-semibold text-lg">{profile?.badge === 'None' ? 'New Member' : profile?.badge}</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="bg-white/50 p-2 rounded-lg">
                                    <p className="text-muted-foreground text-xs uppercase tracking-wider">Sessions</p>
                                    <p className="font-bold text-lg">{profile?.stats?.count || 0}</p>
                                </div>
                                <div className="bg-white/50 p-2 rounded-lg">
                                    <p className="text-muted-foreground text-xs uppercase tracking-wider">Rating</p>
                                    <p className="font-bold text-lg">{profile?.stats?.average ? Number(profile.stats.average).toFixed(1) : '-'}</p>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground px-4">
                                "Service is the rent we pay for the privilege of living on this earth."
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* 12-Step Tracker */}
                <Card>
                    <CardHeader><CardTitle>The 12 Steps</CardTitle></CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[400px] pr-4">
                            <div className="space-y-6">
                                {[...Array(12)].map((_, i) => {
                                    const stepNum = i + 1;
                                    const stepData = steps?.find(s => s.stepNumber === stepNum);
                                    const isComplete = stepData?.status === 'completed';

                                    return (
                                        <StepItem
                                            key={stepNum}
                                            num={stepNum}
                                            data={stepData}
                                        />
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}

function StepItem({ num, data }: { num: number, data?: StepProgress }) {
    const updateMutation = useMutation({
        mutationFn: async (vars: { status: string, notes: string }) => {
            await apiRequest("POST", `/api/recovery/steps/${num}`, vars);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/recovery/steps"] });
        }
    });

    const [notes, setNotes] = useState(data?.notes || "");
    const isComplete = data?.status === 'completed';

    useEffect(() => { setNotes(data?.notes || "") }, [data]);

    return (
        <div className={`p-4 rounded-lg border ${isComplete ? 'bg-green-50 border-green-200' : 'bg-card'}`}>
            <div className="flex items-start gap-4">
                <div
                    className="cursor-pointer mt-1"
                    onClick={() => updateMutation.mutate({ status: isComplete ? 'in_progress' : 'completed', notes })}
                >
                    {isComplete ? <CheckCircle className="text-green-600" /> : <Circle className="text-muted-foreground" />}
                </div>
                <div className="flex-1 space-y-2">
                    <div className="font-semibold">Step {num}</div>
                    <p className="text-sm text-muted-foreground">
                        {getStepDescription(num)}
                    </p>
                    <Textarea
                        placeholder="Journal your thoughts on this step..."
                        className="bg-white/50"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        onBlur={() => updateMutation.mutate({ status: data?.status || 'not_started', notes })}
                    />
                </div>
            </div>
        </div>
    );
}

function getStepDescription(num: number) {
    const steps = [
        "We admitted we were powerless over our addiction - that our lives had become unmanageable.",
        "Came to believe that a Power greater than ourselves could restore us to sanity.",
        "Made a decision to turn our will and our lives over to the care of God as we understood Him.",
        "Made a searching and fearless moral inventory of ourselves.",
        "Admitted to God, to ourselves, and to another human being the exact nature of our wrongs.",
        "Were entirely ready to have God remove all these defects of character.",
        "Humbly asked Him to remove our shortcomings.",
        "Made a list of all persons we had harmed, and became willing to make amends to them all.",
        "Made direct amends to such people wherever possible, except when to do so would injure them or others.",
        "Continued to take personal inventory and when we were wrong promptly admitted it.",
        "Sought through prayer and meditation to improve our conscious contact with God, praying only for knowledge of His will for us and the power to carry that out.",
        "Having had a spiritual awakening as the result of these steps, we tried to carry this message to addicts, and to practice these principles in all our affairs."
    ];
    return steps[num - 1];
}
