import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogTitle,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import { Star } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface RatingDialogProps {
    isOpen: boolean;
    onClose: () => void;
    sessionId: string;
    partnerId: string; // socketID or userId, but for ratings we need userId mostly. 
    // Actually, our API might map session/socket to user. 
    // Let's pass the sessionId and let backend figure it out or pass socketId.
}

export function RatingDialog({ isOpen, onClose, sessionId, partnerId }: RatingDialogProps) {
    const [rating, setRating] = useState(0);
    const [submitted, setSubmitted] = useState(false);

    const mutation = useMutation({
        mutationFn: async (ratingVal: number) => {
            await apiRequest("POST", "/api/ratings", {
                rating: ratingVal,
                sessionId,
                partnerSocketId: partnerId
            });
        },
        onSuccess: () => {
            setSubmitted(true);
            setTimeout(onClose, 2000);
        }
    });

    return (
        <AlertDialog open={isOpen}>
            <AlertDialogContent className="sm:max-w-[425px]">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-center text-xl">
                        {submitted ? "Thank You!" : "Rate your Listener"}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-center">
                        {submitted
                            ? "Your feedback helps our community grow stronger."
                            : "How helpful was this conversation?"}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {!submitted && (
                    <div className="flex justify-center gap-2 py-6">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={`w-8 h-8 cursor-pointer transition-all ${star <= rating ? "fill-yellow-400 text-yellow-400 scale-110" : "text-gray-300"
                                    }`}
                                onClick={() => setRating(star)}
                            />
                        ))}
                    </div>
                )}

                <AlertDialogFooter className="sm:justify-center">
                    {!submitted && (
                        <AlertDialogAction
                            disabled={rating === 0 || mutation.isPending}
                            onClick={() => mutation.mutate(rating)}
                            className="w-full sm:w-auto"
                        >
                            {mutation.isPending ? "Submitting..." : "Submit Rating"}
                        </AlertDialogAction>
                    )}
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
