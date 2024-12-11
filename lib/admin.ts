import { auth } from "@clerk/nextjs/server";

const adminIds = [
    "user_2lYokaGqGxiRTVgt0hpHcUCDih6"
];

export const isAdmin = () => {
    const {userId} = auth();

    if (!userId) {
        return false;
    }

    return adminIds.indexOf(userId) !== -1;
}