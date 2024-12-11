"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import db from "@/db/drizzle";
import { and, eq } from "drizzle-orm";
import { challenges, challengeProgress, userProgress } from "@/db/schema";
import { getUserProgress, getUserSubscription } from "@/db/queries";

// when u selected the correct option
export const upsertChallengeProgress = async (challengeId: number) => {
    const { userId } = auth();

    if (!userId){
        return;
    }

    const currentUserProgress = await getUserProgress();
    const userSubscription = await getUserSubscription();

    if (!currentUserProgress) {
        throw new Error("User progress not found");
    }

    const challenge = await db.query.challenges.findFirst({
        where: eq(challenges.id, challengeId)
    });

    if (!challenge){
        throw new Error("Challenge not found");
    }

    const lessonId = challenge.lessonId;
    const existingChallengeProgress = await db.query.challengeProgress.findFirst({
        where: and(
            eq(challengeProgress.userId, userId),
            eq(challengeProgress.challengeId, challengeId),
        ),
    });

    const isPractice = !!existingChallengeProgress;

    if (currentUserProgress.hearts === 0 && !isPractice && !userSubscription?.isActive){
        return { error: "hearts" };
    }

    if (isPractice){
        // just in case completed is somehow false
        await db.update(challengeProgress).set({
            completed: true,
        }).where(
            eq(challengeProgress.id, existingChallengeProgress.id)
        );
        
        // practicing already completed challenges gives you extra hearts and points
        await db.update(userProgress).set({
            hearts: Math.min(currentUserProgress.hearts + 1, 5),
            points: currentUserProgress.points + 10,
        }).where(
            eq(userProgress.userId, userId),
        );

        // recache all paths which are going to use these values (like hearts, points)
        revalidatePath("/learn");
        revalidatePath("/lesson");
        revalidatePath("/quests");
        revalidatePath("/leaderboard");
        revalidatePath(`/lesson/${lessonId}`);
        return;
    }
    
    await db.insert(challengeProgress).values({
        challengeId,
        userId,
        completed: true,
    });
    
    await db.update(userProgress).set({
        points: currentUserProgress.points + 10,
    }).where(
        eq(userProgress.userId, userId),
    );
    
    // recache all paths which are going to use these values (like hearts, points), it causes a re - render of those paths
    // You can view this in .next/cache folder, revalidatedAt changes
    // revalidatePath only affects the part outside the return statement, that is only the part written before return() is re - executed, if the data, props change then the component is re - rendered from the next request to the same path, the current execution context is not affected
    revalidatePath("/learn");
    revalidatePath("/lesson");
    revalidatePath("/quests");
    revalidatePath("/leaderboard");
    revalidatePath(`/lesson/${lessonId}`);
};