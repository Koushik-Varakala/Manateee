import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Therapist, Content } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Calendar, FileText, Video, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

type TherapistWithContent = Therapist & { content: Content[] };

export default function TherapistProfile() {
    const [, params] = useRoute("/therapist/:id");
    const id = params?.id;

    const { data: therapist, isLoading } = useQuery<TherapistWithContent>({
        queryKey: [`/api/therapists/${id}`],
        enabled: !!id,
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!therapist) {
        return <div className="text-center py-12">Therapist not found.</div>;
    }

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <Link href="/therapists">
                <Button variant="ghost" className="mb-4 pl-0 gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back to Directory
                </Button>
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Sidebar Info */}
                <div className="md:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">{therapist.fullName}</CardTitle>
                            {therapist.isVerified && (
                                <Badge variant="secondary" className="w-fit">Verified</Badge>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                {therapist.specialties?.map((s) => (
                                    <Badge key={s} variant="outline">{s}</Badge>
                                ))}
                            </div>

                            <Button className="w-full gap-2">
                                <Calendar className="h-4 w-4" /> Book Session
                            </Button>
                            <p className="text-xs text-muted-foreground text-center">
                                Available for 50 min sessions
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="md:col-span-2">
                    <Tabs defaultValue="about">
                        <TabsList className="mb-4">
                            <TabsTrigger value="about">About</TabsTrigger>
                            <TabsTrigger value="content">posts & Videos</TabsTrigger>
                        </TabsList>

                        <TabsContent value="about">
                            <Card>
                                <CardHeader><CardTitle>Biography</CardTitle></CardHeader>
                                <CardContent>
                                    <p className="whitespace-pre-wrap leading-relaxed">
                                        {therapist.bio}
                                    </p>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="content" className="space-y-4">
                            {therapist.content?.length === 0 && (
                                <div className="text-muted-foreground">No content published yet.</div>
                            )}
                            {therapist.content?.map((item) => (
                                <Card key={item.id}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg">{item.title}</CardTitle>
                                            {item.type === 'video' ? <Video className="h-4 w-4 text-blue-500" /> : <FileText className="h-4 w-4 text-green-500" />}
                                        </div>
                                        <p className="text-xs text-muted-foreground">{new Date(item.createdAt!).toLocaleDateString()}</p>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="line-clamp-3 text-sm text-muted-foreground">{item.body}</p>
                                        <Button variant="ghost" className="px-0">Read More</Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
