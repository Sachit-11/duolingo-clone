import { StickyWrapper } from "@/components/sticky-wrapper";
import { FeedWrapper } from "@/components/feed-wrapper";
import { Header } from "./header";
import { UserProgress } from "@/components/user-progress";
import { getCourseProgress, getUnits, getUserProgress, getLessonPercentage, getUserSubscription } from "@/db/queries";
import { redirect } from "next/navigation";
import { Unit } from "./unit";
import { Promo } from "@/components/promo";
import { Quests } from "@/components/quests";

const LearnPage = async () => {
    const userProgressPromise = getUserProgress();
    const courseProgressPromise = getCourseProgress();
    const lessonPercentagePromise = getLessonPercentage();
    const unitsPromise = getUnits();
    const userSubscriptionPromise = getUserSubscription();

    const [ userProgress, courseProgress, lessonPercentage, units, userSubscription ] = await Promise.all([ userProgressPromise, courseProgressPromise, lessonPercentagePromise, unitsPromise, userSubscriptionPromise]);

    if (!userProgress || !userProgress.activeCourse || !courseProgress) {
        // replaces the current URL in the browser history stack (for server components)
        return redirect("/courses");
    }

    const isPro = !!userSubscription?.isActive;

    return (
        <div className = "flex flex-row-reverse gap-[48px] px-6">
            <StickyWrapper>
                <UserProgress
                    activeCourse = {userProgress.activeCourse}
                    hearts = {userProgress.hearts}
                    points = {userProgress.points}
                    hasActiveSubscription = {isPro}
                />
                {!isPro && <Promo />}
                <Quests points = {userProgress.points} />
            </StickyWrapper>
            <FeedWrapper>
                <Header title = {userProgress.activeCourse.title} />
                {units.map((unit) => (
                    <div key = {unit.id} className = "mb-10">
                        <Unit
                            id = {unit.id}
                            order = {unit.order}
                            description = {unit.description}
                            title = {unit.title}
                            lessons = {unit.lessons}
                            activeLesson = {courseProgress.activeLesson}
                            activeLessonPercentage = {lessonPercentage}
                        />
                    </div>
                ))}
            </FeedWrapper>
        </div>
    );
}

export default LearnPage;