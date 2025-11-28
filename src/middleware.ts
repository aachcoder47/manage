import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/pricing",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/call(.*)",
  "/api/register-call(.*)",
  "/api/get-call(.*)",
  "/api/generate-interview-questions(.*)",
  "/api/create-interviewer(.*)",
  "/api/analyze-communication(.*)",
]);

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/interview(.*)",
]);

export default clerkMiddleware((auth, req) => {
  console.log("Middleware checking route:", req.url);
  if (isPublicRoute(req)) {
    console.log("Route is public:", req.url);
    return;
  }
  
  auth().protect();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
