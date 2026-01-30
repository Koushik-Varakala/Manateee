import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useSocket } from "@/hooks/use-socket";
import { useState } from "react";
import { Plus } from "lucide-react";

const createRoomSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(50),
    genre: z.enum(["sad", "happy", "anxious", "lonely", "excited", "other"]),
    capacity: z.coerce.number().min(2).max(13),
});

export function CreateRoomDialog() {
    const { createRoom } = useSocket();
    const [open, setOpen] = useState(false);

    const form = useForm<z.infer<typeof createRoomSchema>>({
        resolver: zodResolver(createRoomSchema),
        defaultValues: {
            title: "",
            genre: "happy",
            capacity: 5,
        },
    });

    function onSubmit(data: z.infer<typeof createRoomSchema>) {
        createRoom(data.title, data.genre, data.capacity);
        setOpen(false);
        form.reset();
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25">
                    <Plus className="w-4 h-4" />
                    Host Session
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white rounded-2xl shadow-2xl border-0">
                <DialogHeader>
                    <DialogTitle className="text-xl font-display">Host a Group Session</DialogTitle>
                    <DialogDescription>
                        Create a safe space for people to connect.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Room Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Anxiety Support Group" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="genre"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Vibe/Topic</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a vibe" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="sad">Sad / Grief</SelectItem>
                                                <SelectItem value="happy">Happy / Celebration</SelectItem>
                                                <SelectItem value="anxious">Anxious / Stress</SelectItem>
                                                <SelectItem value="lonely">Lonely</SelectItem>
                                                <SelectItem value="excited">Excited</SelectItem>
                                                <SelectItem value="other">General / Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="capacity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Capacity</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="submit" className="w-full sm:w-auto">Create Room</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
