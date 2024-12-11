"use client";

import { courses, userProgress } from "@/db/schema";
import { Card } from "./card";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { upsertUserProgress } from "@/actions/user-progress";
import { toast } from "sonner";

type Props = {
    // type of courses is an array of objects => [ { id: number; title: string; imageSrc: string; } ]
    courses : typeof courses.$inferSelect[];
    // ? denotes that activeCourseId is optional in the object, this means it could either have a value or be undefined
    activeCourseId?: typeof userProgress.$inferSelect["activeCourseId"];
};

export const List = ({ courses, activeCourseId } : Props) => {
    const router = useRouter(); 
    // useTransition is a React Hook that lets you manage background state update without blocking the UI, i.e your UI stays responsive in the middle of a re-render. For example, if the user clicks a tab but then change their mind and click another tab, they can do that without waiting for the first re-render to finish.
    // It avoids multiple API requests (useful when API are heavy), and stops background tasks from overlapping and causing conflicts.
    const [isPending, startTransition] = useTransition(); 

    const onClick = (id: number) => {
        // If you have multiple courses and the user clicks one while another transition is in progress, the code will ignore the subsequent click until the ongoing transition completes.
	    // The primary use of isPending is to prevent unnecessary or overlapping state updates while one transition is still pending (i.e the function inside startTransition is still executing), keeping the UI responsive (by avoiding multiple requests if each request is expensive) and avoiding potential conflicts between background tasks.
        // Note that by passing isPending to the disabled prop of the Card component, you can prevent the user from clicking the card while a transition is in progress. So this is not required to be handled in the onClick function.
        if (isPending){
            return;
        }

        if (id === activeCourseId){
            // You can use router.replace to replace the current URL in the browser history, instead of adding a new entry to the history stack. This is useful when you don't want the user to navigate back to the previous page.
            return router.push("/learn");
        }

        // it just delays the re render of the page until the other important task is done
        // it always causes a render of the component and it's children
        startTransition(() => {
            upsertUserProgress(id).catch(() => {
                toast.error("Something went wrong");
            });
        });
    };

    return (
        <div className = "pt-6 grid grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-4">
            {courses.map((course) => (
                <Card key = {course.id} id = {course.id} title = {course.title} imageSrc = {course.imageSrc} onClick = {onClick} disabled = {isPending} active = {course.id === activeCourseId} />
            ))}
        </div>
    )
};