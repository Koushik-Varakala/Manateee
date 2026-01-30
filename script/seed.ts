
import { db } from "../server/db";
import { users, therapists, content } from "../shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
}

async function main() {
    console.log("Seeding database...");

    const password = await hashPassword("password123");

    // Create Therapist Users
    const [user1] = await db.insert(users).values({
        username: "dr_sarah",
        password,
        isGuest: false,
        role: "therapist",
    }).returning();

    const [user2] = await db.insert(users).values({
        username: "counselor_mike",
        password,
        isGuest: false,
        role: "therapist",
    }).returning();

    // Create Profiles
    const [t1] = await db.insert(therapists).values({
        userId: user1.id,
        fullName: "Dr. Sarah Mitchell, PhD",
        bio: "Clinical psychologist with 10+ years of experience specializing in anxiety and depression. I believe in a compassionate, evidence-based approach to mental wellness.",
        specialties: ["Anxiety", "Depression", "CBT"],
        isVerified: true,
    }).returning();

    const [t2] = await db.insert(therapists).values({
        userId: user2.id,
        fullName: "Mike Ross, LMFT",
        bio: "Licensed Marriage and Family Therapist helping couples and individuals navigate relationship challenges and building stronger connections.",
        specialties: ["Relationships", "Trauma", "Family Therapy"],
        isVerified: true,
    }).returning();

    // Create Content
    await db.insert(content).values([
        {
            authorId: t1.id,
            title: "Understanding Anxiety Triggers",
            body: "Anxiety often stems from... (full article content would go here). It's important to recognize the physical signs...",
            type: "post",
        },
        {
            authorId: t1.id,
            title: "5 Minute Grounding Technique",
            body: "Watch this video to learn a quick grounding exercise.",
            type: "video",
        },
        {
            authorId: t2.id,
            title: "Active Listening in Relationships",
            body: "Communication is key. Here is how to practice active listenining...",
            type: "post",
        }
    ]);

    console.log("Seeding complete!");
    process.exit(0);
}

main().catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
});
