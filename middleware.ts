import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// stripe webhooks has it's own authentication so you don't need to protect it (check in /api/webhooks/stripe/route.ts)
const isPublicRoute = createRouteMatcher(["/", "/api/webhooks/stripe"]);
export default clerkMiddleware((auth, request) => {
  if(!isPublicRoute(request)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}