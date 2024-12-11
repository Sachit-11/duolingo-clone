"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { usePracticeModal } from "@/store/use-practice-modal";

export const PracticeModal = () => {
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    const { isOpen, close } = usePracticeModal();

    // setting isClient to true after the component mounts to avoid hydration errors as useEffect only runs after hydration is done
    useEffect(() => setIsClient(true), []);

    if (!isClient){
        return null;
    }

    return (
        <Dialog open = {isOpen} onOpenChange = {close}>
            <DialogContent className = "max-w-md">
                <DialogHeader>
                    <div className = "flex items-center w-full justify-center mb-5">
                        <Image
                            src = "/heart.svg"
                            alt = "Heart"
                            height = {100}
                            width = {100}
                        />
                    </div>
                    <DialogTitle className = "text-center font-bold text-2xl">
                        Practice lesson
                    </DialogTitle>
                    <DialogDescription className = "text-center text-base">
                        Use practice lesson to regain hearts and points. You cannot loose hearts or points in practice lessons.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <div className = "flex flex-col gap-y-4 w-full">
                        <Button 
                            variant = "primary"
                            className = "w-full"
                            size = "lg"
                            onClick = {close}
                        >
                            I understand
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
};