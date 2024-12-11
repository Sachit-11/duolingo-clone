import { NextResponse } from "next/server";

import db from "@/db/drizzle";
import { isAdmin } from "@/lib/admin";
import { challengeOptions } from "@/db/schema";
import { count } from "drizzle-orm";

export const GET = async (req: Request) => {
    if (!isAdmin()){
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const url = new URL(req.url);
    const rangeParam = url.searchParams.get('range'); // Get the range parameter

    if (!rangeParam) {
        return NextResponse.json({ error: "Missing range parameter" }, { status: 400 });
    }

    // Decode and parse the range parameter (it's JSON encoded)
    const range = JSON.parse(rangeParam); // e.g., [0, 24]
    const start = range[0];
    const end = range[1];

    // Calculate items per page and current page
    const perPage = end - start + 1; // Items per page
    const currPage = Math.floor(start / perPage) + 1; // Page number (1-based)

    // Fetch data (you might want to apply limits and offsets based on start and end)
    const data = await db.query.challengeOptions.findMany({
        offset: start,
        limit: perPage,
    });

    // Calculate total (React Admin expects this in the headers or response body)
    const total = (await db.select({ count: count() }).from(challengeOptions))[0].count;

    // Return the response
    return new NextResponse(JSON.stringify(data), {
         // Required by React Admin to display page numbers, basically for pagination
        headers: {
            'Content-Range': `challengeOptions ${start}-${end}/${total}`,
        },
    });
};

export const POST = async (req: Request) => {
    if (!isAdmin()){
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    // .returning is used to return the inserted data
    const data = await db.insert(challengeOptions).values({
        ...body,
    }).returning();

    return NextResponse.json(data[0]);
};