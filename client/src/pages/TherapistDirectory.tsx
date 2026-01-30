import { useQuery } from "@tanstack/react-query";
import { Therapist } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Link } from "wouter";

export default function TherapistDirectory() {
    const { data: therapists, isLoading } = useQuery<Therapist[]>({
        queryKey: ["/api/therapists"],
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500 mb-2">
                    Find a Professional
                </h1>
                <p className="text-muted-foreground text-lg">
                    Connect with verified therapists and counselors for structured support.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {therapists?.map((therapist) => (
                    <Card key={therapist.id} className="hover:shadow-lg transition-shadow border-primary/10">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-xl">{therapist.fullName}</CardTitle>
                                    {therapist.isVerified && (
                                        <Badge variant="secondary" className="mt-1 text-xs">Verified Professional</Badge>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground line-clamp-3">
                                    {therapist.bio}
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    {therapist.specialties?.slice(0, 3).map((s) => (
                                        <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                                    ))}
                                    {therapist.specialties && therapist.specialties.length > 3 && (
                                        <Badge variant="outline" className="text-xs">+{therapist.specialties.length - 3}</Badge>
                                    )}
                                </div>

                                <Link href={`/therapist/${therapist.id}`}>
                                    <Button className="w-full mt-4">View Profile</Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {therapists?.length === 0 && (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        No therapists found.
                    </div>
                )}
            </div>
        </div>
    );
}
