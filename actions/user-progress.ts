// For server actions (functions that are executed on the server but are invoked from client side) we need to explicitly write “use server”; at the top of the file, this is because the server actions are not automatically imported by the client side code. They can be invoked only through post request
"use server";

import { auth, currentUser } from "@clerk/nextjs/server";

import db from "@/db/drizzle";
import { and, eq } from "drizzle-orm";
import { challenges, challengeProgress, userProgress } from "@/db/schema";
import { getCourseById, getUserProgress, getUserSubscription } from "@/db/queries";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { POINTS_TO_REFILL } from "@/constants";

// upsert means to insert a new record if it does not exist or update the existing record if it does exist
// This function updates the user progress in the database and in the cache immediately after the user selects a course to learn. It also redirects the user to the learn page after the course is selected.
export const upsertUserProgress = async (courseId: number) => {
    const { userId } = auth();
    // backend user
    const user = await currentUser();

    if (!userId || !user){
        throw new Error("Unauthorized");
    }

    const course = await getCourseById(courseId);
    if (!course){
        throw new Error("Course not found");
    }

    if (!course.units.length || !course.units[0].lessons.length){
        throw new Error("Course is empty");
    } 

    const exisitingUserProgress = await getUserProgress();

    if (exisitingUserProgress){
        await db.update(userProgress).set({
            activeCourseId: courseId,
            userName: user.firstName || "User",
            userImageSrc: user.imageUrl || "/mascot.svg",
        });
    }
    else{
        await db.insert(userProgress).values({
            userId,
            activeCourseId: courseId,
            userName: user.firstName || "User",
            userImageSrc: user.imageUrl || "/mascot.svg",
        });
    }

    // In Next.js, particularly when working with Server Actions or Static Site Generation (SSG), data can be cached for better performance. Caching is beneficial because it allows pages to load faster, but it also means that any updates to dynamic data won’t immediately appear on the site unless you refresh that cache.

    // recache all paths which are going to use these updated values, it causes a re - render of those paths
    // You can view this in .next/cache folder, revalidatedAt changes
    revalidatePath("/courses");
    revalidatePath("/learn");

    // As this redirect is in a server action, the default behaviour is to push the url to the browser history. 
    // Note: Though it does not work, if you want to replace the current url in the browser history, you should use the replace option. For Ex - redirect("/learn", RedirectType.replace);
    // you will see a post/courses due to server action with 303 code (i.e. redirected) which means after processing post /courses request it redirected, in this case to /learn
    redirect("/learn");
};

export const reduceHearts = async (challengeId: number) => {
    const { userId } = await auth();

    if (!userId){
        throw new Error("Unauthorized");
    }

    const currentUserProgress = await getUserProgress();
    const userSubscription = await getUserSubscription();

    const currentChallenge = await db.query.challenges.findFirst({
        where: eq(challenges.id, challengeId),
    })

    if (!currentChallenge){
        throw new Error("Challenge not found");
    }

    const lessonId = currentChallenge.lessonId;

    const exisitingchallengeProgress = await db.query.challengeProgress.findFirst({
        where: and(
            eq(challengeProgress.userId, userId),
            eq(challengeProgress.challengeId, challengeId),
        )
    })

    const isPractice = !!exisitingchallengeProgress;
    if (isPractice){
        return { error: "practice" };
    }

    if (!currentUserProgress){
        throw new Error("User progress not found");
    }

    if (userSubscription?.isActive){
        return { error: "subscription" };
    }

    if (currentUserProgress.hearts === 0){
        return { error: "hearts" };
    }

    await db.update(userProgress).set({
        hearts: Math.max(currentUserProgress.hearts - 1, 0),
    }).where(eq(userProgress.userId, userId));

    revalidatePath("/shop");
    revalidatePath("/learn");
    revalidatePath("/quests");
    revalidatePath("/leaderboard");
    revalidatePath(`/lesson/${lessonId}`);
};

export const refillHearts = async () => {
    const currentUserProgress = await getUserProgress();

    if (!currentUserProgress){
        throw new Error("User progress not found");
    }

    if (currentUserProgress.hearts === 5){
        throw new Error("Hearts are already full");
    }

    if (currentUserProgress.points < POINTS_TO_REFILL){
        throw new Error("Not enough points");
    }

    await db.update(userProgress).set({
        hearts: 5,
        points: currentUserProgress.points - POINTS_TO_REFILL,
    }).where(eq(userProgress.userId, currentUserProgress.userId));

    // this is necessary to reload the shop page so as to reflect the reduced no of points
    revalidatePath("/shop");
    revalidatePath("/learn");
    revalidatePath("/quests");
    revalidatePath("/leaderboard");
};