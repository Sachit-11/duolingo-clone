import { cache } from "react";

import { auth } from "@clerk/nextjs/server";

import { eq } from "drizzle-orm";
import { courses, userProgress, units, challengeProgress, lessons, userSubscription } from "@/db/schema";
import db from "./drizzle";

// findFirst returns either the data or undefined
// findMany returns an array of data or an empty array

// async functions always returns a promise, it automatically wraps the result in a promise

// cache is a react hook that caches the result of the function
// it is request memoization => https://nextjs.org/docs/app/building-your-application/caching
// it has got nothing to do with revalidatePath

export const getCourses = cache(async () => {
    // this gives an object with keys as [0, 1, 2, 3...] and corresponding values as [{ id: 1, title: 'Spanish', imageSrc: '/es.svg' }, {}, {}, ..]
    // findMany without conditions returns all records
    const data = await db.query.courses.findMany();
    return data;
});

export const getUserProgress = cache(async () => {
    const { userId } = auth();

    if (!userId) {
        return null;
    }

    const data = await db.query.userProgress.findFirst({
        where: eq(userProgress.userId, userId),
        // setting activeCourse Relation to true will automatically pull in all fields from the courses table where the activeCourseId matches courses.id.
        with: {
            // since activeCourse is a one relation, it will either return the corresponding course if found, otherwise it will return null as the value
            activeCourse: true,
        },
    });

    return data;
});

export const getCourseById = cache(async (courseId: number) => {
    const data = await db.query.courses.findFirst({
        where: eq(courses.id, courseId),
        with: {
            units: {
                orderBy: (units, { asc }) => [asc(units.order)],
                with: {
                    lessons:{
                        orderBy: (lessons, { asc }) => [asc(lessons.order)],
                    }
                },
            },
        },
    });

    return data;
});

export const getUnits = cache(async () => {
    const { userId } = auth();
    const userProgress = await getUserProgress();

    if (!userId || !userProgress?.activeCourseId){
        return [];
    }

    const data = await db.query.units.findMany({
        orderBy: (units, { asc }) => [asc(units.order)],
        where: eq(units.courseId, userProgress.activeCourseId), 
        with: {
            // since lessons is a many relation, it will either return the corresponding array of all the lessons it has if any, otherwise it will return an empty array as the value
            lessons: {
                orderBy: (lessons, { asc }) => [asc(lessons.order)],
                with: {
                    challenges: {
                        orderBy: (challenges, { asc }) => [asc(challenges.order)],
                        with: {
                            challengeProgress: {
                                where: eq(challengeProgress.userId, userId),
                            },
                        },
                    },
                },
            },
        },
    });

    // Note: In ChallengeProgress we will have an array (since it is a many relation) but as we are finding for a particular challenge for a particular user there will be only one element in the array

    // map returns a new array with the results of calling a provided function on every element in the array
    const normalizedData = data.map((unit) => {
        const lessonsWithCompletedStatus = unit.lessons.map((lesson) => {
            // Below if check is needed for the case when there is no challenges for a lesson as then the every method would return true and the lesson would be marked as completed, though such a thing won't happen in production
            if (lesson.challenges.length === 0){
                return { ...lesson, completed: false };
            }
            // every() method tests whether all elements in the array pass the test implemented by the provided function, returns true if all pass otherwise false
            const allCompletedChallenges = lesson.challenges.every((challenge) => {
                return challenge.challengeProgress && challenge.challengeProgress.length > 0  && challenge.challengeProgress.every((progress) => progress.completed);
            })

            return { ...lesson, completed: allCompletedChallenges };
        })

        return { ...unit, lessons: lessonsWithCompletedStatus };
    });

    return normalizedData;
});

export const getCourseProgress = cache(async () => {
    const { userId } = auth();
    const userProgress = await getUserProgress();

    if (!userId || !userProgress?.activeCourseId){
        return null;
    }

    const unitsInActiveCourse = await db.query.units.findMany({
        orderBy: (units, { asc }) => [asc(units.order)],
        where: eq(units.courseId, userProgress.activeCourseId),
        with: {
            lessons: {
                orderBy: (lessons, { asc }) => [asc(lessons.order)],
                with: {
                    unit: true,
                    challenges: {
                        with: {
                            challengeProgress: {
                                where: eq(challengeProgress.userId, userId),
                            },
                        },
                    },
                },
            },
        },
    });

    // flatMap is a combination of map and flat, it maps each element using a mapping function and then flattens the result into a new array
    // If no elements are found, find returns undefined
    const firstUnCompletedLesson = unitsInActiveCourse.flatMap((unit) => unit.lessons).find((lesson) => {
        // some is used to check if at least one element in the array passes the test implemented by the provided function
        return lesson.challenges.some((challenge) => {
            return !challenge.challengeProgress 
            || challenge.challengeProgress.length === 0
            || challenge.challengeProgress.some((progress) => progress.completed === false)
            ;
        });
    });

    return {
        activeLesson: firstUnCompletedLesson,
        activeLessonId: firstUnCompletedLesson?.id,
    }
});

export const getLesson = cache(async(id?: number) => {
    const { userId } = auth();

    if (!userId) {
        return null;
    }

    const courseProgress = await getCourseProgress();

    const lessonId = id || courseProgress?.activeLessonId;

    if (!lessonId) {
        return null;
    }

    const data = await db.query.lessons.findFirst({
        where: eq(lessons.id, lessonId),
        with: {
            challenges: {
                orderBy: (challenges, { asc }) => [asc(challenges.order)],
                with: {
                    challengeOptions: true,
                    challengeProgress: {
                        where: eq(challengeProgress.userId, userId),
                    },
                },
            },
        },
    });

    if (!data || !data.challenges) {
        return null;
    }
    
    const normalizedChallenges = data.challenges.map((challenge) => {
        const completed = challenge.challengeProgress 
        && challenge.challengeProgress.length > 0 
        && challenge.challengeProgress.every((progress) => progress.completed);

        return {...challenge, completed};
    });

    return { ...data, challenges: normalizedChallenges };
});

export const getLessonPercentage = cache(async () => {
    const courseProgress = await getCourseProgress();

    if (!courseProgress?.activeLessonId){
        return 0;
    }

    const lesson = await getLesson(courseProgress.activeLessonId);

    if (!lesson){
        return 0;
    }

    const completedChallenges = lesson.challenges.filter((challenge) => challenge.completed);
    const percentage = Math.round((completedChallenges.length / lesson.challenges.length) * 100);

    return percentage;
});

// This _ is purely for readability
const DAY_IN_MS = 86_400_000;
export const getUserSubscription = cache(async () => {
    const { userId } = auth();

    if (!userId) {
        return null;
    }

    const data = await db.query.userSubscription.findFirst({
        where: eq(userSubscription.userId, userId),
    });

    if (!data){
        return null;
    }

    // .getTime() converts the date to milliseconds, so we can compare it with Date.now() which also returns milliseconds
    const isActive = data.stripePriceId && data.stripeCurrentPeriodEnd?.getTime() + DAY_IN_MS > Date.now();

    return {
        ...data,
        isActive: !!isActive,
    };
});

export const getTopTenUsers = cache(async () => {
    const { userId } = auth();

    if (!userId){
        return [];
    }

    const data = await db.query.userProgress.findMany({
        orderBy: (userProgress, { desc }) => [desc(userProgress.points)],
        limit: 10,
        columns: {
            userId: true,
            userName: true,
            userImageSrc: true,
            points: true,
        }
    });

    return data;
});