import Stripe from "stripe";
import { stripe } from "@/lib/stripe";

import { headers } from "next/headers";
import { NextResponse } from "next/server";

import db from "@/db/drizzle";
import { userSubscription } from "@/db/schema";
import { eq } from "drizzle-orm";

// We are using web hooks for detecting stripe payments, note that if we try to do immediately after server action using .then() then it may not work as payment may take place after some time due to some security check.
// We use the command stripe listen --forward-to localhost:3000/api/webhooks/stripe which sets up the Stripe CLI to listen for events from your Stripe account and forward them to this local end point.
export async function POST(req: Request) {
    const body = await req.text();
    const signature = headers().get("Stripe-Signature") as string;

    let event: Stripe.Event;

    try{
        // security check (authentication of the web hook)
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: any){
        return new NextResponse(`Webhook error: ${error.message}`, {
            status: 400,
        });
    };

    const session = event.data.object as Stripe.Checkout.Session;
    
    // only happens if user is buying a subscription for the first time, it doesn't matter if the payment is successful or not
    // we won't check this in case of a renewal
    if (event.type === "checkout.session.completed"){
        console.log("checkout.session.completed");
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        );
        
        if (!session?.metadata?.userId){
            return new NextResponse("User ID is required", {
                status: 400,
            });
        }

        await db.insert(userSubscription).values({
            userId: session.metadata.userId,
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: subscription.customer as string,
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(
                // seconds to milli seconds
                subscription.current_period_end * 1000
            ),
        });
    }

    // after payment is successful
    if (event.type === "invoice.payment_succeeded"){
        console.log("invoice.payment_succeeded");
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        );

        await db.update(userSubscription).set({
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(
                // seconds to milli seconds
                subscription.current_period_end * 1000
            ),
        }).where(
            eq(userSubscription.stripeSubscriptionId, subscription.id)
        );
    }

    return new NextResponse(null, {
        status: 200,
    });
};