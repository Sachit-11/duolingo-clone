import Stripe from "stripe";

// stripe Object Initialization with your API Key
export const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
    apiVersion: "2024-11-20.acacia",
    typescript: true,
})