
import { postRouter } from "~/server/api/routers/post";
import { createTRPCRouter } from "~/server/api/trpc";
import { tripRouter } from "~/server/api/routers/trip";
import { delayExtractionRouter } from './routers/delay-storage';
import { journeyRouter } from "./routers/journey";
import { insightsRouter } from './routers/insights';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  trip: tripRouter,
  journey: journeyRouter,
  delayStorage: delayExtractionRouter,
  insights: insightsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
